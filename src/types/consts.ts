type BanStatus = 0|1|2;

const BAN_STATUS_NORMAL: BanStatus = 0;
const BAN_STATUS_QUIET: BanStatus = 1;
const BAN_STATUS_BANNED: BanStatus = 2;

const consts = { BAN_STATUS_NORMAL, BAN_STATUS_QUIET, BAN_STATUS_BANNED };

export { consts, BanStatus };
