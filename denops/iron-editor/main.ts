import type { Entrypoint } from "jsr:@denops/std@7.0.3";
import { getline, setbufline, setbufvar } from "jsr:@denops/std@7.0.3/function";
import { open } from "jsr:@denops/std@7.0.3/buffer";
import { extractParticipante } from "./answer1.ts";
import { convertPrismaSchemaToTblsObject } from "./answer2.ts";
import { stringify } from "jsr:@std/yaml@1.0.1";

export const main: Entrypoint = (denops) => {
  denops.dispatcher = {
    answer1: async () => {
      const lines = await getline(denops, 1, "$");
      const info = await open(denops, "answer1", {
        opener: "split",
      });
      await setbufvar(denops, info.bufnr, "&buftype", "nofile");
      await setbufline(denops, info.bufnr, 1, extractParticipante(lines));
    },
    answer2: async () => {
      const lines = await getline(denops, 1, "$");
      const info = await open(denops, "answer2", {
        opener: "split",
      });
      await setbufvar(denops, info.bufnr, "&buftype", "nofile");
      await setbufvar(denops, info.bufnr, "&filetype", "yaml");
      await setbufline(
        denops,
        info.bufnr,
        1,
        stringify(convertPrismaSchemaToTblsObject(lines)).split("\n"),
      );
    },
  };
};
