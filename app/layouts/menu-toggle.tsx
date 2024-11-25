import { IconArrowFlatLinesLeft } from "@/assets/icons";

import type { loader } from "@/root";

import { Fragment } from "react";
import { useLoaderData } from "react-router";

export const MenuToggle = () => {
  const data = useLoaderData<typeof loader>();

  const { sidebar_state } = data.config;
  return (
    <Fragment>
      <input type="hidden" name="sidebar_state" value={sidebar_state} />
      <button
        type="submit"
        className="grid grid-cols-[2ch_1fr] gap-4 py-4 pl-8 text-grey-300"
      >
        <IconArrowFlatLinesLeft
          data-ui={sidebar_state}
          className="text-lg data-compact:rotate-180"
        />
        <span
          data-ui={sidebar_state}
          className="overflow-hidden whitespace-nowrap text-base transition-opacity delay-300 ease-in-out data-compact:max-w-0 data-compact:opacity-0"
        >
          Minimize Menu
        </span>
      </button>
    </Fragment>
  );
};
