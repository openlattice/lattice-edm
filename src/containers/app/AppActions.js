/*
 * @flow
 */

const TOGGLE_ONLINE :'TOGGLE_ONLINE' = 'TOGGLE_ONLINE';
type ToggleOnlineAction = {
  type :typeof TOGGLE_ONLINE;
};

function toggleOnline() :ToggleOnlineAction {
  return {
    type: TOGGLE_ONLINE,
  };
}

export {
  TOGGLE_ONLINE,
  toggleOnline,
};
