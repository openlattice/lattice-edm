/*
 * @flow
 */

const AbstractTypes = {
  AssociationType: 'AssociationType',
  EntityType: 'EntityType',
  PropertyType: 'PropertyType',
  Schema: 'Schema'
};

export type AbstractType = $Keys<typeof AbstractTypes>;

export {
  AbstractTypes as default
};
