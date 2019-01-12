/*
 * @flow
 */

type AbstractTypeEnum = {|
  AssociationType :'AssociationType';
  EntityType :'EntityType';
  PropertyType :'PropertyType';
  Schema :'Schema';
|};
type AbstractType = $Values<AbstractTypeEnum>;

const AbstractTypes :AbstractTypeEnum = Object.freeze({
  AssociationType: 'AssociationType',
  EntityType: 'EntityType',
  PropertyType: 'PropertyType',
  Schema: 'Schema',
});

export {
  AbstractTypes as default,
};

export type {
  AbstractType,
  AbstractTypeEnum,
};
