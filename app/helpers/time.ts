// SPDX-License-Identifier: Apache-2.0
type Duration = { d: number; h: number; m: number; s: number };
export const secs = ({ d = 0, h = 0, m = 0, s = 0 }: Partial<Duration>) =>
  d * 86400 + h * 3600 + m * 60 + s;
