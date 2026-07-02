export type DirectoryRecord = {
  userId: string;
  encPub: JsonWebKey;
  signPub: JsonWebKey;
  encThumbprintHex: string;
  signThumbprintHex: string;
  updatedAt: number;
};

const store = new Map<string, DirectoryRecord>();

export function publishToDirectory(rec: DirectoryRecord): void {
  store.set(rec.userId, rec);
}

export function fetchFromDirectory(userId: string): DirectoryRecord | null {
  return store.get(userId) ?? null;
}
