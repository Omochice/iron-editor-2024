import { stringify } from "jsr:@std/yaml@1.0.1";

type Comment = {
  table: string;
  tableComment: string;
  columnComments: Record<string, string>;
};

type TblsObject = {
  comments: Comment[];
};

/**
 * Concate comment lines
 *
 * @param lines file contents split by line
 * @returns concated lines
 *
 * @example
 * ```ts
 * const file = `
 * /// アカウント
 * model Account {
 *     /// ID
 *     id                String  \@id \@default(cuid())
 *     /// ユーザーID
 *     userId            String
 *     /// タイプ
 *     type              String
 *     /// リフレッシュトークン
 *     refresh_token     String? \@db.Text
 * }
 * `.trim()
 * concateCommentLines(file.split("\n"))
 * // => [
 *   "/// アカウント model Account {",
 *   "   /// ID id                String  \@id \@default(cuid())",
 *   "   /// ユーザーID userId            String",
 *   "   /// タイプ type              String",
 *   "   /// リフレッシュトークン refresh_token     String? \@db.Text",
 *   "}",
 * ]
 */
function concateCommentLines(lines: readonly string[]): string[] {
  const concatedLines: string[] = [];
  /** whether the last loop concated */
  let doesLastLoopConcate = false;

  for (const line of lines) {
    const lastline = concatedLines.at(-1);
    if (lastline == null || doesLastLoopConcate) {
      concatedLines.push(line);
      doesLastLoopConcate = false;
      continue;
    }
    if (lastline.trimStart().startsWith("///")) {
      concatedLines[concatedLines.length - 1] = `${lastline} ${line}`;
      doesLastLoopConcate = true;
      continue;
    }
    concatedLines.push(line);
  }
  return concatedLines;
}

/**
 * The mapCommentLines description
 *
 * @param lines The lines that are concated by concateCommentLines
 * @returns The TblsObject
 *
 * @example
 * ```ts
 * const lines = [
 *   "/// アカウント model Account {",
 *   "   /// ID id                String  \@id \@default(cuid())",
 *   "   /// ユーザーID userId            String",
 *   "   /// タイプ type              String",
 *   "   /// リフレッシュトークン refresh_token     String? \@db.Text",
 *   "}",
 * ]
 * mapCommentLines(lines)
 * // => {
 *   table: "Account",
 *   tableComment: "アカウント",
 *   columnComments: {
 *     id: "ユーザーID",
 *     userId: "ユーザーID",
 *     type: "タイプ",
 *     refresh_token: "リフレッシュトークン",
 *   },
 * }
 */
function mapCommentLines(lines: readonly string[]): TblsObject {
  const re = /^\s*?\/\/\/\s+?(?<comment>\S+?)\s+?(?<type>\S+?)\s+?(?<name>\S+)/;
  const comments: Comment[] = [];

  for (const line of lines) {
    const match = line.match(re);
    if (match == null) {
      continue;
    }
    const groups = match.groups;
    if (groups == null) {
      continue;
    }
    if (groups.type === "model") {
      comments.push({
        table: groups.name,
        tableComment: groups.comment,
        columnComments: {},
      });
    } else {
      comments[comments.length - 1].columnComments[groups.type] =
        groups.comment;
    }
  }
  return { comments };
}

/**
 * Convert Prisma schema to TblsObject
 *
 * @param lines The lines of Prisma schema file
 * @returns The TblsObject
 * @example
 * ```ts
 * const file = `
 * /// アカウント
 * model Account {
 *     /// ID
 *     id                String  \@id \@default(cuid())
 *     /// ユーザーID
 *     userId            String
 *     /// タイプ
 *     type              String
 *     /// リフレッシュトークン
 *     refresh_token     String? \@db.Text
 * }
 * `.trim()
 * convertPrismaSchemaToTblsObject(file.split("\n"))
 * // => {
 *   comments: [
 *     table: "Account",
 *     tableComment: "アカウント",
 *     columnComments: {
 *       id: "ユーザーID",
 *       userId: "ユーザーID",
 *       type: "タイプ",
 *       refresh_token: "リフレッシュトークン",
 *     },
 *   ],
 * }
 */
export function convertPrismaSchemaToTblsObject(
  lines: readonly string[],
): TblsObject {
  return mapCommentLines(concateCommentLines(lines));
}

if (import.meta.main) {
  const lines = Deno.readTextFileSync(Deno.args[0]).split(/\r?\n/);
  const tblsObject = convertPrismaSchemaToTblsObject(lines);
  console.log(stringify(tblsObject));
}
