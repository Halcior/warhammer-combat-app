export type RawDatasheet = {
  id: string;
  name: string;
  faction_id: string;
  source_id: string;
  legend?: string;
  role?: string;
  loadout?: string;
  transport?: string;
  virtual?: string;
  leader_head?: string;
  leader_footer?: string;
  damaged_w?: string;
  damaged_description?: string;
  link?: string;
};

export type RawWargear = {
  datasheet_id: string;
  line: string;
  line_in_wargear: string;
  dice?: string;
  name: string;
  description?: string;
  range: string;
  type: string;
  A: string;
  BS_WS: string;
  S: string;
  AP: string;
  D: string;
};

export type RawKeyword = {
  datasheet_id: string;
  keyword: string;
  model?: string;
  is_faction_keyword: string;
};