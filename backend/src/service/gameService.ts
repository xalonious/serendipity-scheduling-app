import axios from "axios";
import SpecialTag from "../schemas/specialTag";
import ServiceError from "../core/ServiceError";

const API_KEY = process.env.OPEN_CLOUD_API_KEY!;
const client = axios.create({
  baseURL: "https://apis.roblox.com/cloud/v2",
  headers: {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
  },
});

let roleMap: Record<number, string> = {};

async function loadRoles(groupId: number) {
  let allRoles: Array<{ id: string; rank: number }> = [];
  let pageToken: string | undefined;
  try {
    do {
      const url =
        `/groups/${groupId}/roles?maxPageSize=100` +
        (pageToken ? `&pageToken=${pageToken}` : "");
      const res = await client.get(url);
      allRoles.push(...res.data.groupRoles);
      pageToken = res.data.nextPageToken;
    } while (pageToken);
    roleMap = allRoles.reduce((m, r) => {
      m[r.rank] = r.id;
      return m;
    }, {} as Record<number, string>);
  } catch (err: any) {
    throw ServiceError.internalServerError(
      `Failed to load group roles: ${err.message}`
    );
  }
}

loadRoles(4346739).catch(() => undefined);

export async function changeUserRank(
  groupId: number,
  membershipId: number | string,
  displayRank: number
) {
  if (roleMap[displayRank] === undefined) {
    await loadRoles(groupId);
  }
  const apiRoleId = roleMap[displayRank];
  if (!apiRoleId) {
    throw ServiceError.internalServerError(
      `No role at display rank ${displayRank} in group ${groupId}`
    );
  }
  const path = `/groups/${groupId}/memberships/${membershipId}`;
  const body = { role: `groups/${groupId}/roles/${apiRoleId}` };
  try {
    const { data } = await client.patch(path, body);
    return data;
  } catch (err: any) {
    throw ServiceError.internalServerError(
      `Failed to change user rank: ${err.message}`
    );
  }
}


export async function fetchGamePasses(universeId: string) {
  const BASE_URL = `https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes`;

  try {
    const all: any[] = [];
    let pageToken: string | undefined;

    do {
      const res = await axios.get(BASE_URL, {
        params: {
          passView: "Full",
          pageSize: 100,
          ...(pageToken ? { pageToken } : {}),
        },
      });

      const { gamePasses = [], nextPageToken } = res.data || {};
      all.push(...gamePasses);
      pageToken = nextPageToken || undefined;
    } while (pageToken);

    const filtered = all.filter(
      (p) => p.isForSale === true && typeof p.price === "number"
    );

    return { data: filtered };
  } catch (err: any) {
    throw ServiceError.internalServerError(
      `Failed to fetch game passes: ${err.message}`
    );
  }
}

export async function fetchUserGames(userId: string) {
  try {
    const res = await axios.get(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=2&limit=50&sortOrder=Asc`
    );
    return res.data;
  } catch (err: any) {
    throw ServiceError.internalServerError(`Failed to fetch user games: ${err.message}`);
  }
}

export async function fetchSpecialTag(
  robloxId: string
): Promise<{ specialTag: Array<"EOTM" | "Booster" | "CC"> }> {
  try {
    const userDoc = await SpecialTag.findOne({ robloxid: robloxId }).exec();

    if (!userDoc) {
      return { specialTag: [] };
    }

    const tagMap: Record<string, "EOTM" | "Booster" | "CC"> = {
      EOTM: "EOTM",
      BOOSTER: "Booster",
      CONTENT_CREATOR: "CC",
    };

    const specialTags = userDoc.tags
      .map(tag => tagMap[tag])
      .filter((t): t is "EOTM" | "Booster" | "CC" => !!t);

    return { specialTag: specialTags };
  } catch (err: any) {
    throw ServiceError.internalServerError(
      `Failed to fetch special tag: ${err.message}`
    );
  }
}

export async function proxyWebhook(url: string, content?: string, embed?: any) {
  if (!url.startsWith("https://discord.com/api/webhooks/")) {
    throw ServiceError.validationFailed("Invalid webhook URL");
  }

  try {
    await axios.get(url); 
  } catch {
    throw ServiceError.validationFailed("Webhook URL does not exist or is inaccessible");
  }

  if (!content && !embed) {
    throw ServiceError.validationFailed("Either content or embed must be provided");
  }

  const payload: any = { content };

  if (embed) {
    if (!embed.title) {
      throw ServiceError.validationFailed("Embed must include a title");
    }

    const { title, description, color, thumbnail, image, fields } = embed;

    payload.embeds = [
      {
        title,
        description,
        color,
        thumbnail: thumbnail ? { url: thumbnail } : undefined,
        image: image ? { url: image } : undefined,
        fields: Array.isArray(fields) ? fields : undefined,
      },
    ];
  }

  try {
    await axios.post(url, payload);
    return { status: 200, body: { message: "Webhook sent successfully" } };
  } catch (err: any) {
    throw ServiceError.internalServerError(`Failed to send webhook: ${err.message}`);
  }
}