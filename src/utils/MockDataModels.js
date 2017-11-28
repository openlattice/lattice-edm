/*
 * @flow
 */

import { Models, Types } from 'lattice';

const {
  AnalyzerTypes,
  SecurableTypes
} = Types;

const {
  AssociationType,
  AssociationTypeBuilder,
  EntityType,
  EntityTypeBuilder,
  PropertyType,
  PropertyTypeBuilder
} = Models;

export const MOCK_ENTITY_TYPE_DM :EntityType = new EntityTypeBuilder()
  .setId('ec6865e6-e60e-424b-a071-6a9c1603d735')
  .setType({ namespace: 'OpenLattice', name: 'MockType' })
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
  .setCategory(SecurableTypes.EntityType)
  .setSchemas([{ namespace: 'OpenLattice', name: 'MockSchema' }])
  .build();

export const MOCK_ENTITY_TYPE_JSON = {
  id: 'ec6865e6-e60e-424b-a071-6a9c1603d735',
  type: { namespace: 'OpenLattice', name: 'MockType' },
  title: 'title',
  description: 'description',
  key: [
    '0c8be4b7-0bd5-4dd1-a623-da78871c9d0e',
    '4b08e1f9-4a00-4169-92ea-10e377070220'
  ],
  properties: [
    '8f79e123-3411-4099-a41f-88e5d22d0e8d',
    'e39dfdfa-a3e6-4f1f-b54b-646a723c3085',
    'fae6af98-2675-45bd-9a5b-1619a87235a8'
  ],
  baseType: '9a768c9b-b76f-4fa1-be60-0178695cdbc3',
  category: 'EntityType',
  schemas: [{ namespace: 'OpenLattice', name: 'MockSchema' }]
};

export const MOCK_PROPERTY_TYPE_DM :PropertyType = new PropertyTypeBuilder()
  .setId('ec6865e6-e60e-424b-a071-6a9c1603d735')
  .setType({ namespace: 'OpenLattice', name: 'MockType' })
  .setTitle('title')
  .setDescription('description')
  .setDataType('String')
  .setPii(false)
  .setAnalyzer(AnalyzerTypes.STANDARD)
  .setSchemas([{ namespace: 'OpenLattice', name: 'MockSchema' }])
  .build();

export const MOCK_PROPERTY_TYPE_JSON = {
  id: 'ec6865e6-e60e-424b-a071-6a9c1603d735',
  type: { namespace: 'OpenLattice', name: 'MockType' },
  title: 'title',
  description: 'description',
  datatype: 'String',
  piiField: false,
  analyzer: 'STANDARD',
  schemas: [{ namespace: 'OpenLattice', name: 'MockSchema' }]
};

export const MOCK_ASSOCIATION_TYPE_DM :AssociationType = new AssociationTypeBuilder()
  .setEntityType(MOCK_ENTITY_TYPE_DM)
  .setSourceEntityTypeIds(['c49832e9-8c49-4d24-984a-2221b4fa249b'])
  .setDestinationEntityTypeIds(['91385fae-babc-4bd3-ba42-74decb9036f0'])
  .setBidirectional(false)
  .build();

export const MOCK_ASSOCIATION_TYPE_JSON = {
  entityType: MOCK_ENTITY_TYPE_JSON,
  src: ['c49832e9-8c49-4d24-984a-2221b4fa249b'],
  dst: ['91385fae-babc-4bd3-ba42-74decb9036f0'],
  bidirectional: false
};
