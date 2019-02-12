/*
 * @flow
 */

function genRandomBoolean() :boolean {

  return Math.random() >= 0.5;
}

function genRandomString() :string {

  return Math.random().toString(36).slice(2);
}

export {
  genRandomBoolean,
  genRandomString,
};
