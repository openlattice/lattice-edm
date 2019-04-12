/*
 * @flow
 */

const TOGGLE_ONLINE :'TOGGLE_ONLINE' = 'TOGGLE_ONLINE';
function toggleOnline() :Object {
  return {
    type: TOGGLE_ONLINE,
  };
}

export {
  TOGGLE_ONLINE,
  toggleOnline,
};
