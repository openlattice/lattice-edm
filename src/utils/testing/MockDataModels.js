/*
 * @flow
 */

import randomUUID from 'uuid/v4';
import { Models, Types } from 'lattice';
import type { FQN } from 'lattice';

import { genRandomBoolean, genRandomString } from './MockUtils';

const {
  AnalyzerTypes,
  IndexTypes,
  SecurableTypes,
} = Types;

const {
  AssociationType,
  AssociationTypeBuilder,
  EntityType,
  EntityTypeBuilder,
  FullyQualifiedName,
  PropertyType,
  PropertyTypeBuilder,
  Schema,
  SchemaBuilder,
} = Models;

const MOCK_ASSOCIATION_TYPE_FQN :FQN = new FullyQualifiedName('OpenLattice', 'MockAssociationType');
const MOCK_ENTITY_TYPE_FQN :FQN = new FullyQualifiedName('OpenLattice', 'MockEntityType');
const MOCK_PROPERTY_TYPE_FQN :FQN = new FullyQualifiedName('OpenLattice', 'MockPropertyType');
const MOCK_SCHEMA_FQN :FQN = new FullyQualifiedName('OpenLattice', 'MockSchema');

function genRandomFQN() :FQN {
  return new FullyQualifiedName(genRandomString(), genRandomString());
}

const MOCK_ENTITY_TYPE :EntityType = new EntityTypeBuilder()
  .setBaseType('9a768c9b-b76f-4fa1-be60-0178695cdbc3')
  .setCategory(SecurableTypes.EntityType)
  .setDescription('description')
  .setId('ec6865e6-e60e-424b-a071-6a9c1603d735')
  .setKey([
    '0c8be4b7-0bd5-4dd1-a623-da78871c9d0e',
    '4b08e1f9-4a00-4169-92ea-10e377070220',
  ])
  .setPropertyTags({
    '11f65a3c-158e-4bea-9e6d-dc7ff2396ef0': ['TAG_0', 'TAG_1'],
    '5993e81e-1265-4d00-8b25-9dafb5261bd4': ['TAG_0'],
  })
  .setPropertyTypes([
    '8f79e123-3411-4099-a41f-88e5d22d0e8d',
    'e39dfdfa-a3e6-4f1f-b54b-646a723c3085',
    'fae6af98-2675-45bd-9a5b-1619a87235a8',
  ])
  .setSchemas([MOCK_SCHEMA_FQN])
  .setShards(1)
  .setTitle('title')
  .setType(MOCK_ENTITY_TYPE_FQN)
  .build();

function genRandomEntityType() :EntityType {
  return new EntityTypeBuilder()
    .setBaseType(randomUUID())
    .setCategory(SecurableTypes.EntityType)
    .setDescription(genRandomString())
    .setId(randomUUID())
    .setKey([randomUUID(), randomUUID()])
    .setPropertyTags({
      [randomUUID()]: [genRandomString(), genRandomString()],
      [randomUUID()]: [genRandomString()],
    })
    .setPropertyTypes([randomUUID(), randomUUID(), randomUUID()])
    .setSchemas([new FullyQualifiedName(genRandomString(), genRandomString())])
    .setShards(1)
    .setTitle(genRandomString())
    .setType(new FullyQualifiedName(genRandomString(), genRandomString()))
    .build();
}

const MOCK_PROPERTY_TYPE :PropertyType = new PropertyTypeBuilder()
  .setAnalyzer(AnalyzerTypes.STANDARD)
  .setDataType('String')
  .setDescription('description')
  .setEnumValues(['ENUM_1', 'ENUM_2'])
  .setId('3771c28a-cdee-403b-9cea-48845210f8ab')
  .setIndexType(IndexTypes.BTREE)
  .setMultiValued(false)
  .setPii(false)
  .setSchemas([MOCK_SCHEMA_FQN])
  .setTitle('title')
  .setType(MOCK_PROPERTY_TYPE_FQN)
  .build();

function genRandomPropertyType() :PropertyType {
  return new PropertyTypeBuilder()
    .setAnalyzer(AnalyzerTypes.STANDARD)
    .setDataType('String')
    .setDescription(genRandomString())
    .setEnumValues([genRandomString(), genRandomString()])
    .setId(randomUUID())
    .setIndexType(IndexTypes.HASH)
    .setMultiValued(genRandomBoolean())
    .setPii(genRandomBoolean())
    .setSchemas([genRandomFQN()])
    .setTitle(genRandomString())
    .setType(genRandomFQN())
    .build();
}

const MOCK_ASSOCIATION_ENTITY_TYPE :EntityType = new EntityTypeBuilder()
  .setId('ec6865e6-e60e-424b-a071-6a9c1603d735')
  .setType(MOCK_ASSOCIATION_TYPE_FQN)
  .setTitle('title')
  .setDescription('description')
  .setKey([
    '0c8be4b7-0bd5-4dd1-a623-da78871c9d0e',
    '4b08e1f9-4a00-4169-92ea-10e377070220'
  ])
  .setPropertyTypes([
    '8f79e123-3411-4099-a41f-88e5d22d0e8d',
    'e39dfdfa-a3e6-4f1f-b54b-646a723c3085',
    'fae6af98-2675-45bd-9a5b-1619a87235a8'
  ])
  .setBaseType('9a768c9b-b76f-4fa1-be60-0178695cdbc3')
  .setCategory(SecurableTypes.AssociationType)
  .setSchemas([MOCK_SCHEMA_FQN])
  .build();

const MOCK_ASSOCIATION_TYPE :AssociationType = new AssociationTypeBuilder()
  .setEntityType(MOCK_ASSOCIATION_ENTITY_TYPE)
  .setSourceEntityTypeIds(['c49832e9-8c49-4d24-984a-2221b4fa249b'])
  .setDestinationEntityTypeIds(['91385fae-babc-4bd3-ba42-74decb9036f0'])
  .setBidirectional(false)
  .build();

function genRandomAssociationType() :AssociationType {
  return new AssociationTypeBuilder()
    .setEntityType(genRandomEntityType())
    .setSourceEntityTypeIds([randomUUID(), randomUUID()])
    .setDestinationEntityTypeIds([randomUUID(), randomUUID(), randomUUID()])
    .setBidirectional(genRandomBoolean())
    .build();
}

const MOCK_SCHEMA :Schema = new SchemaBuilder()
  .setFullyQualifiedName(MOCK_SCHEMA_FQN)
  .setEntityTypes([MOCK_ENTITY_TYPE])
  .setPropertyTypes([MOCK_PROPERTY_TYPE])
  .build();

export {
  MOCK_ASSOCIATION_TYPE,
  MOCK_ENTITY_TYPE,
  MOCK_PROPERTY_TYPE,
  MOCK_SCHEMA,
  genRandomAssociationType,
  genRandomEntityType,
  genRandomFQN,
  genRandomPropertyType,
};
