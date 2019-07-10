/*
 * @flow
 */

import React from 'react';

import Select from 'react-select';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { Models, Types } from 'lattice';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import type { AnalyzerType, FQN, IndexType } from 'lattice';
import type { RequestSequence } from 'redux-reqseq';

import AbstractTypes from '../../utils/AbstractTypes';
import AbstractTypeDataTable from '../../components/datatable/AbstractTypeDataTable';
import AbstractTypeSearchableSelect from '../../components/controls/AbstractTypeSearchableSelect';
import InlineEditableControl from '../../components/controls/InlineEditableControl';
import Logger from '../../utils/Logger';
import StyledButton from '../../components/buttons/StyledButton';
import StyledCard from '../../components/cards/StyledCard';
import * as AssociationTypesActions from './associationtypes/AssociationTypesActions';
import * as EntityTypesActions from './entitytypes/EntityTypesActions';
import * as PropertyTypesActions from './propertytypes/PropertyTypesActions';
import * as SchemasActions from './schemas/SchemasActions';
import { EDM_PRIMITIVE_TYPES } from '../../utils/EdmPrimitiveTypes';
import type { AbstractType } from '../../utils/AbstractTypes';

const LOG :Logger = new Logger('AbstractTypeCreateContainer');

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

const {
  AnalyzerTypes,
  IndexTypes,
  SecurableTypes
} = Types;

/*
 * constants
 */

const BIDI_RADIO_NAME :string = 'associationTypeBidi';
const BIDI_YES_RADIO_ID :string = 'associationTypeBidi-1';
const BIDI_NO_RADIO_ID :string = 'associationTypeBidi-2';

const PII_RADIO_NAME :string = 'propertyTypePii';
const PII_YES_RADIO_ID :string = 'propertyTypePii-1';
const PII_NO_RADIO_ID :string = 'propertyTypePii-2';

const MV_RADIO_NAME :string = 'propertyTypeMultiValued';
const MV_YES_RADIO_ID :string = 'propertyTypeMultiValued-1';
const MV_NO_RADIO_ID :string = 'propertyTypeMultiValued-2';

const DATA_TYPE_RS_OPTIONS = EDM_PRIMITIVE_TYPES.map(
  (primitive :string) => ({ label: primitive, value: primitive })
);

const ANALYZER_TYPE_RS_OPTIONS = Object.keys(AnalyzerTypes).map(
  (analyzerType :AnalyzerType) => ({ label: analyzerType, value: analyzerType })
);

const INDEX_TYPE_RS_OPTIONS = Object.keys(IndexTypes).map(
  (indexType :IndexType) => ({ label: indexType, value: indexType })
);

/*
 * styled components
 */

const AbstractTypeCreateCard = styled(StyledCard)`
  flex: 50%;
  max-width: 1000px;
  min-width: 500px;
`;

const ActionButtons = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 20px;
  button {
    margin: 0 10px;
  }
`;

const PhoneticCheckboxWrapper = styled.label`
  margin-top: 20px;
  input {
    margin-right: 8px;
  }
`;

const RadiosRowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  label {
    margin-right: 20px;
  }
  input {
    margin-right: 8px;
  }
`;

const AbstractTypeSearchableSelectWrapper = styled.div`
  margin: 20px 0;
`;

const PrimaryKeyPropertyTypesSection = styled.section`
  z-index: 1000;
`;

const PropertyTypesSection = styled.section`
  z-index: 900;
`;

/*
 * types
 */

type Props = {
  actions :{
    localCreateAssociationType :RequestSequence;
    localCreateEntityType :RequestSequence;
    localCreatePropertyType :RequestSequence;
    localCreateSchema :RequestSequence;
  };
  entityTypes :List<Map<*, *>>;
  onCancel :() => void;
  onSubmit :() => void;
  propertyTypes :List<Map<*, *>>;
  workingAbstractTypeType :AbstractType;
};

type State = {
  analyzerValue :AnalyzerType;
  bidiValue :boolean;
  datatypeValue :string;
  descriptionValue :string;
  indexTypeValue :IndexType;
  isInEditModeName :boolean;
  isInEditModeNamespace :boolean;
  isInEditModeTitle :boolean;
  multiValuedValue :boolean;
  nameValue :string;
  namespaceValue :string;
  phoneticSearchesValue :boolean;
  piiValue :boolean;
  selectedDestinationEntityTypes :Set<Map<*, *>>;
  selectedPrimaryKeyPropertyTypes :Set<Map<*, *>>;
  selectedPropertyTypes :Set<Map<*, *>>;
  selectedSourceEntityTypes :Set<Map<*, *>>;
  titleValue :string;
};

class AbstractTypeCreateContainer extends React.Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      analyzerValue: AnalyzerTypes.STANDARD,
      bidiValue: false,
      datatypeValue: 'String',
      descriptionValue: '',
      indexTypeValue: IndexTypes.BTREE,
      isInEditModeName: true,
      isInEditModeNamespace: true,
      isInEditModeTitle: true,
      multiValuedValue: true,
      nameValue: '',
      namespaceValue: '',
      phoneticSearchesValue: false,
      piiValue: false,
      selectedDestinationEntityTypes: Set(),
      selectedPrimaryKeyPropertyTypes: Set(),
      selectedPropertyTypes: Set(),
      selectedSourceEntityTypes: Set(),
      titleValue: '',
    };
  }

  isReadyToSubmit = () :boolean => {

    const { workingAbstractTypeType } = this.props;
    const {
      datatypeValue,
      isInEditModeName,
      isInEditModeNamespace,
      isInEditModeTitle,
      nameValue,
      namespaceValue,
      titleValue,
      selectedPrimaryKeyPropertyTypes,
      selectedPropertyTypes
    } = this.state;

    let isReadyToSubmit :boolean = (
      !isInEditModeName
      && !isInEditModeNamespace
      && !!nameValue
      && !!namespaceValue
    );

    if (workingAbstractTypeType === AbstractTypes.Schema) {
      return isReadyToSubmit;
    }

    isReadyToSubmit = isReadyToSubmit
      && !isInEditModeTitle
      && !!titleValue;

    if (workingAbstractTypeType === AbstractTypes.PropertyType) {
      isReadyToSubmit = isReadyToSubmit && !!datatypeValue;
    }
    else {
      isReadyToSubmit = isReadyToSubmit
        && (!selectedPropertyTypes.isEmpty() || !selectedPrimaryKeyPropertyTypes.isEmpty());
    }

    return isReadyToSubmit;
  }

  submitCreateAbstractTypeRequest = () => {

    const { actions, onSubmit, workingAbstractTypeType } = this.props;
    const {
      analyzerValue,
      bidiValue,
      datatypeValue,
      descriptionValue,
      indexTypeValue,
      multiValuedValue,
      nameValue,
      namespaceValue,
      phoneticSearchesValue,
      piiValue,
      titleValue,
      selectedDestinationEntityTypes,
      selectedPrimaryKeyPropertyTypes,
      selectedPropertyTypes,
      selectedSourceEntityTypes
    } = this.state;

    if (workingAbstractTypeType === AbstractTypes.Schema) {

      const newSchema :Schema = (new SchemaBuilder())
        .setFullyQualifiedName(new FullyQualifiedName(namespaceValue, nameValue))
        .build();

      actions.localCreateSchema(newSchema);
    }
    else if (workingAbstractTypeType === AbstractTypes.PropertyType) {

      const analyzer :AnalyzerType = (datatypeValue === 'String' && phoneticSearchesValue)
        ? AnalyzerTypes.METAPHONE
        : analyzerValue;

      const newPropertyType :PropertyType = new PropertyTypeBuilder()
        .setAnalyzer(analyzer)
        .setDataType(datatypeValue)
        .setDescription(descriptionValue)
        .setIndexType(indexTypeValue)
        .setMultiValued(multiValuedValue)
        .setPii(piiValue)
        .setTitle(titleValue)
        .setType(new FullyQualifiedName(namespaceValue, nameValue))
        .build();

      actions.localCreatePropertyType(newPropertyType);
    }
    else {

      const primaryKeyPropertyTypeIds :Set<string> = selectedPrimaryKeyPropertyTypes
        .map((propertyType :Map<*, *>) => propertyType.get('id', ''));

      const propertyTypeIds :Set<string> = selectedPropertyTypes
        .map((propertyType :Map<*, *>) => propertyType.get('id', ''))
        .concat(primaryKeyPropertyTypeIds);

      const entityTypeBuilder :EntityTypeBuilder = new EntityTypeBuilder()
        .setDescription(descriptionValue)
        .setKey(primaryKeyPropertyTypeIds.toJS())
        .setPropertyTypes(propertyTypeIds.toJS())
        .setTitle(titleValue)
        .setType(new FullyQualifiedName(namespaceValue, nameValue));

      if (workingAbstractTypeType === AbstractTypes.EntityType) {

        const newEntityType :EntityType = entityTypeBuilder
          .setCategory(SecurableTypes.EntityType)
          .build();

        actions.localCreateEntityType(newEntityType);
      }
      else if (workingAbstractTypeType === AbstractTypes.AssociationType) {

        const newAssociationEntityType :EntityType = entityTypeBuilder
          .setCategory(SecurableTypes.AssociationType)
          .build();

        const sourceEntityTypeIds :Set<string> = selectedSourceEntityTypes
          .map((entityType :Map<*, *>) => entityType.get('id', ''));

        const destinationEntityTypeIds :Set<string> = selectedDestinationEntityTypes
          .map((entityType :Map<*, *>) => entityType.get('id', ''));

        const newAssociationType :AssociationType = new AssociationTypeBuilder()
          .setEntityType(newAssociationEntityType)
          .setSourceEntityTypeIds(sourceEntityTypeIds.toJS())
          .setDestinationEntityTypeIds(destinationEntityTypeIds.toJS())
          .setBidirectional(bidiValue)
          .build();

        actions.localCreateAssociationType(newAssociationType);
      }
      else {
        LOG.error('invalid AbstractType:', workingAbstractTypeType);
      }
    }

    if (onSubmit) {
      onSubmit();
    }
  }

  addToSelectedDestinationEntityTypes = (selectedEntityTypeFQN :FQN) => {

    const { entityTypes } = this.props;
    const { selectedDestinationEntityTypes } = this.state;

    const selectedEntityType :Map<*, *> = entityTypes.find((entityType :Map<*, *>) => (
      FullyQualifiedName.toString(entityType.get('type', Map())) === selectedEntityTypeFQN.toString()
    ));

    this.setState({
      selectedDestinationEntityTypes: selectedDestinationEntityTypes.add(selectedEntityType),
    });
  }

  addToSelectedPrimaryKeyPropertyTypes = (selectedPropertyTypeFQN :FQN) => {

    const { propertyTypes } = this.props;
    const { selectedPrimaryKeyPropertyTypes, selectedPropertyTypes } = this.state;

    const selectedPropertyType :Map<*, *> = propertyTypes.find((propertyType :Map<*, *>) => (
      FullyQualifiedName.toString(propertyType.get('type', Map())) === selectedPropertyTypeFQN.toString()
    ));

    this.setState({
      selectedPrimaryKeyPropertyTypes: selectedPrimaryKeyPropertyTypes.add(selectedPropertyType),
      selectedPropertyTypes: selectedPropertyTypes.subtract(selectedPrimaryKeyPropertyTypes),
    });
  }

  addToSelectedPropertyTypes = (selectedPropertyTypeFQN :FQN) => {

    const { propertyTypes } = this.props;
    const { selectedPrimaryKeyPropertyTypes, selectedPropertyTypes } = this.state;

    const selectedPropertyType :Map<*, *> = propertyTypes.find((propertyType :Map<*, *>) => (
      FullyQualifiedName.toString(propertyType.get('type', Map())) === selectedPropertyTypeFQN.toString()
    ));

    if (selectedPrimaryKeyPropertyTypes.contains(selectedPropertyType)) {
      return;
    }

    this.setState({
      selectedPropertyTypes: selectedPropertyTypes.add(selectedPropertyType),
    });
  }

  addToSelectedSourceEntityTypes = (selectedEntityTypeFQN :FQN) => {

    const { entityTypes } = this.props;
    const { selectedSourceEntityTypes } = this.state;

    const selectedEntityType :Map<*, *> = entityTypes.find((entityType :Map<*, *>) => (
      FullyQualifiedName.toString(entityType.get('type', Map())) === selectedEntityTypeFQN.toString()
    ));

    this.setState({
      selectedSourceEntityTypes: selectedSourceEntityTypes.add(selectedEntityType),
    });
  }

  removeFromSelectedDestinationEntityTypes = (selectedEntityTypeFQN :FQN) => {

    const { selectedDestinationEntityTypes } = this.state;

    const updatedSelectedDestinationEntityTypes :Set<Map<*, *>> = selectedDestinationEntityTypes
      .filterNot((entityType :Map<*, *>) => (
        FullyQualifiedName.toString(entityType.get('type', Map())) === selectedEntityTypeFQN.toString()
      ));

    this.setState({
      selectedDestinationEntityTypes: updatedSelectedDestinationEntityTypes,
    });
  }

  removeFromSelectedPrimaryKeyPropertyTypes = (selectedPropertyTypeFQN :FQN) => {

    const { selectedPrimaryKeyPropertyTypes } = this.state;

    const updatedSelectedPrimaryKeyPropertyTypes :Set<Map<*, *>> = selectedPrimaryKeyPropertyTypes
      .filterNot((propertyType :Map<*, *>) => (
        FullyQualifiedName.toString(propertyType.get('type', Map())) === selectedPropertyTypeFQN.toString()
      ));

    this.setState({
      selectedPrimaryKeyPropertyTypes: updatedSelectedPrimaryKeyPropertyTypes,
    });
  }

  removeFromSelectedPropertyTypes = (selectedPropertyTypeFQN :FQN) => {

    const { selectedPropertyTypes } = this.state;

    const updatedSelectedPropertyTypes :Set<Map<*, *>> = selectedPropertyTypes
      .filterNot((propertyType :Map<*, *>) => (
        FullyQualifiedName.toString(propertyType.get('type', Map())) === selectedPropertyTypeFQN.toString()
      ));

    this.setState({
      selectedPropertyTypes: updatedSelectedPropertyTypes,
    });
  }

  removeFromSelectedSourceEntityTypes = (selectedEntityTypeFQN :FQN) => {

    const { selectedSourceEntityTypes } = this.state;

    const updatedSelectedSourceEntityTypes :Set<Map<*, *>> = selectedSourceEntityTypes
      .filterNot((entityType :Map<*, *>) => (
        FullyQualifiedName.toString(entityType.get('type', Map())) === selectedEntityTypeFQN.toString()
      ));

    this.setState({
      selectedSourceEntityTypes: updatedSelectedSourceEntityTypes,
    });
  }

  handleOnChangeAnalyzerType = (rsOption :{ label :string, value :string }) => {

    this.setState({
      analyzerValue: AnalyzerTypes[rsOption.value] || AnalyzerTypes.STANDARD,
    });
  }

  handleOnChangeBidi = (event :SyntheticInputEvent<*>) => {

    this.setState({
      bidiValue: event.target.id === BIDI_YES_RADIO_ID,
    });
  }

  handleOnChangeDataType = (rsOption :{ label :string, value :string }) => {

    let { phoneticSearchesValue } = this.state;
    const datatypeValue = rsOption.value || 'String';

    if (datatypeValue !== 'String') {
      phoneticSearchesValue = false;
    }

    this.setState({
      datatypeValue,
      phoneticSearchesValue,
    });
  }

  handleOnChangeDescription = (description :string) => {

    this.setState({
      descriptionValue: description || '',
    });
  }

  handleOnChangeIndexType = (rsOption :{ label :string, value :string }) => {

    this.setState({
      indexTypeValue: IndexTypes[rsOption.value] || IndexTypes.BTREE,
    });
  }

  handleOnChangeMultiValued = (event :SyntheticInputEvent<*>) => {

    this.setState({
      multiValuedValue: event.target.id === MV_YES_RADIO_ID,
    });
  }

  handleOnChangeName = (name :string) => {

    // TODO: enforce FQN max length <= 63
    // const { namespaceValue } = this.state;
    // const fqn = new FullyQualifiedName(namespaceValue, name);

    this.setState({
      nameValue: name || '',
      isInEditModeName: false,
    });
  }

  handleOnChangeNamespace = (namespace :string) => {

    // TODO: enforce FQN max length <= 63
    // const { nameValue } = this.state;
    // const fqn = new FullyQualifiedName(namespace, nameValue);

    this.setState({
      namespaceValue: namespace || '',
      isInEditModeNamespace: false,
    });
  }

  handleOnChangePhoneticSearches = (event :SyntheticInputEvent<*>) => {

    const { analyzerValue, datatypeValue } = this.state;
    const phoneticSearchesValue = event.target.checked || false;
    const analyzerType = (datatypeValue === 'String' && phoneticSearchesValue)
      ? AnalyzerTypes.METAPHONE
      : analyzerValue;

    this.setState({
      phoneticSearchesValue,
      analyzerValue: analyzerType,
    });
  }

  handleOnChangePii = (event :SyntheticInputEvent<*>) => {

    this.setState({
      piiValue: event.target.id === PII_YES_RADIO_ID,
    });
  }

  handleOnChangeTitle = (title :string) => {

    this.setState({
      titleValue: title || '',
      isInEditModeTitle: false,
    });
  }

  handleOnEditToggleName = (editable :boolean) => {

    this.setState({
      isInEditModeName: editable,
    });
  }

  handleOnEditToggleNamespace = (editable :boolean) => {

    this.setState({
      isInEditModeNamespace: editable,
    });
  }

  handleOnEditToggleTitle = (editable :boolean) => {

    this.setState({
      isInEditModeTitle: editable,
    });
  }

  renderAbstractTypeInputField = (type :string, name :string, onChange :Function, onEditToggle :Function) => (
    <div>
      <h2>
        { name }
      </h2>
      <InlineEditableControl
          type={type}
          placeholder={`${name}...`}
          onChange={onChange}
          onEditToggle={onEditToggle} />
    </div>
  )

  renderTitleSection = () => {

    const { workingAbstractTypeType } = this.props;

    // don't render if we're creating a new Schema
    if (workingAbstractTypeType === AbstractTypes.Schema) {
      return null;
    }

    return (
      <section>
        {
          this.renderAbstractTypeInputField(
            'text',
            'Title',
            this.handleOnChangeTitle,
            this.handleOnEditToggleTitle,
          )
        }
      </section>
    );
  }

  renderDescriptionSection = () => {

    const { workingAbstractTypeType } = this.props;

    // don't render if we're creating a new Schema
    if (workingAbstractTypeType === AbstractTypes.Schema) {
      return null;
    }

    return (
      <section>
        {
          this.renderAbstractTypeInputField(
            'textarea',
            'Description',
            this.handleOnChangeDescription,
            () => {},
          )
        }
      </section>
    );
  }

  renderPropertyTypeDataTypeSelectSection = () => {

    const { workingAbstractTypeType } = this.props;
    const { datatypeValue, phoneticSearchesValue } = this.state;

    if (workingAbstractTypeType !== AbstractTypes.PropertyType) {
      return null;
    }

    return (
      <section>
        <h2>Data Type</h2>
        <Select
            onChange={this.handleOnChangeDataType}
            options={DATA_TYPE_RS_OPTIONS}
            value={{ label: datatypeValue, value: datatypeValue }} />
        {
          datatypeValue !== 'String'
            ? null
            : (
              <PhoneticCheckboxWrapper htmlFor="propertyTypeAllowPhoneticSearches">
                <input
                    type="checkbox"
                    id="propertyTypeAllowPhoneticSearches"
                    onChange={this.handleOnChangePhoneticSearches}
                    checked={phoneticSearchesValue} />
                Allow phonetic searches
              </PhoneticCheckboxWrapper>
            )
        }
      </section>
    );
  }

  renderPropertyTypeAnalyzerTypeSelectSection = () => {

    const { workingAbstractTypeType } = this.props;
    const { analyzerValue } = this.state;
    if (workingAbstractTypeType !== AbstractTypes.PropertyType) {
      return null;
    }

    return (
      <section>
        <h2>Analyzer Type</h2>
        <Select
            onChange={this.handleOnChangeAnalyzerType}
            options={ANALYZER_TYPE_RS_OPTIONS}
            value={{ label: analyzerValue, value: analyzerValue }} />
      </section>
    );
  }

  renderPropertyTypeIndexTypeSelectSection = () => {

    const { workingAbstractTypeType } = this.props;
    const { indexTypeValue } = this.state;
    if (workingAbstractTypeType !== AbstractTypes.PropertyType) {
      return null;
    }

    return (
      <section>
        <h2>Index Type</h2>
        <Select
            onChange={this.handleOnChangeIndexType}
            options={INDEX_TYPE_RS_OPTIONS}
            value={{ label: indexTypeValue, value: indexTypeValue }} />
      </section>
    );
  }

  renderPropertyTypePiiSection = () => {

    const { workingAbstractTypeType } = this.props;
    const { piiValue } = this.state;

    if (workingAbstractTypeType !== AbstractTypes.PropertyType) {
      return null;
    }

    return (
      <section>
        <h2>
          PII
        </h2>
        <RadiosRowWrapper>
          <label htmlFor={PII_YES_RADIO_ID}>
            <input
                type="radio"
                id={PII_YES_RADIO_ID}
                name={PII_RADIO_NAME}
                onChange={this.handleOnChangePii}
                checked={piiValue === true} />
            Yes
          </label>
          <label htmlFor={PII_NO_RADIO_ID}>
            <input
                type="radio"
                id={PII_NO_RADIO_ID}
                name={PII_RADIO_NAME}
                onChange={this.handleOnChangePii}
                checked={piiValue === false} />
            No
          </label>
        </RadiosRowWrapper>
      </section>
    );
  }

  renderPropertyTypeMultiValuedSection = () => {

    const { workingAbstractTypeType } = this.props;
    const { multiValuedValue } = this.state;

    if (workingAbstractTypeType !== AbstractTypes.PropertyType) {
      return null;
    }

    return (
      <section>
        <h2>
          Multi Valued
        </h2>
        <RadiosRowWrapper>
          <label htmlFor={MV_YES_RADIO_ID}>
            <input
                type="radio"
                id={MV_YES_RADIO_ID}
                name={MV_RADIO_NAME}
                onChange={this.handleOnChangeMultiValued}
                checked={multiValuedValue === true} />
            Yes
          </label>
          <label htmlFor={MV_NO_RADIO_ID}>
            <input
                type="radio"
                id={MV_NO_RADIO_ID}
                name={MV_RADIO_NAME}
                onChange={this.handleOnChangeMultiValued}
                checked={multiValuedValue === false} />
            No
          </label>
        </RadiosRowWrapper>
      </section>
    );
  }

  renderAssociationTypeBidirectionalSection = () => {

    const { workingAbstractTypeType } = this.props;
    const { bidiValue } = this.state;

    if (workingAbstractTypeType !== AbstractTypes.AssociationType) {
      return null;
    }

    return (
      <section>
        <h2>
          Bidirectional
        </h2>
        <RadiosRowWrapper>
          <label htmlFor={BIDI_YES_RADIO_ID}>
            <input
                type="radio"
                id={BIDI_YES_RADIO_ID}
                name={BIDI_RADIO_NAME}
                onChange={this.handleOnChangeBidi}
                checked={bidiValue === true} />
            Yes
          </label>
          <label htmlFor={BIDI_NO_RADIO_ID}>
            <input
                type="radio"
                id={BIDI_NO_RADIO_ID}
                name={BIDI_RADIO_NAME}
                onChange={this.handleOnChangeBidi}
                checked={bidiValue === false} />
            No
          </label>
        </RadiosRowWrapper>
      </section>
    );
  }

  renderSelectFromAvailableAbstractTypes = (
    abstractTypes :List<Map<*, *>>,
    abstractTypeType :AbstractType,
    searchPlaceholder :string,
    onAbstractTypeSelect :Function
  ) => (
    <AbstractTypeSearchableSelectWrapper>
      <AbstractTypeSearchableSelect
          abstractTypes={abstractTypes}
          maxHeight={400}
          searchPlaceholder={searchPlaceholder}
          workingAbstractTypeType={abstractTypeType}
          onAbstractTypeSelect={onAbstractTypeSelect} />
    </AbstractTypeSearchableSelectWrapper>
  )

  renderEntityTypePrimaryKeyPropertyTypesSelectSection = () => {

    const { propertyTypes, workingAbstractTypeType } = this.props;
    const { selectedPrimaryKeyPropertyTypes } = this.state;

    // don't render if we're creating a new PropertyType or Schema
    if (workingAbstractTypeType === AbstractTypes.PropertyType
        || workingAbstractTypeType === AbstractTypes.Schema) {
      return null;
    }

    const availablePropertyTypes :Set<Map<*, *>> = propertyTypes.toSet()
      .subtract(selectedPrimaryKeyPropertyTypes);

    return (
      <PrimaryKeyPropertyTypesSection>
        <h2>
          Primary Key PropertyTypes
        </h2>
        {
          selectedPrimaryKeyPropertyTypes.isEmpty()
            ? (
              <p>
                No Primary Key PropertyTypes selected
              </p>
            )
            : (
              <AbstractTypeDataTable
                  abstractTypes={selectedPrimaryKeyPropertyTypes.toList()}
                  maxHeight={400}
                  workingAbstractTypeType={AbstractTypes.PropertyType}
                  onAbstractTypeSelect={this.removeFromSelectedPrimaryKeyPropertyTypes} />
            )
        }
        {
          this.renderSelectFromAvailableAbstractTypes(
            availablePropertyTypes.toList(),
            AbstractTypes.PropertyType,
            'Available PropertyTypes...',
            this.addToSelectedPrimaryKeyPropertyTypes,
          )
        }
      </PrimaryKeyPropertyTypesSection>
    );
  }

  renderEntityTypePropertyTypesSelectSection = () => {

    const { propertyTypes, workingAbstractTypeType } = this.props;
    const { selectedPrimaryKeyPropertyTypes, selectedPropertyTypes } = this.state;

    // don't render if we're creating a new PropertyType or Schema
    if (workingAbstractTypeType === AbstractTypes.PropertyType
        || workingAbstractTypeType === AbstractTypes.Schema) {
      return null;
    }

    const availablePropertyTypes :Set<Map<*, *>> = propertyTypes.toSet()
      .subtract(selectedPropertyTypes)
      .subtract(selectedPrimaryKeyPropertyTypes);

    return (
      <PropertyTypesSection>
        <h2>
          PropertyTypes
        </h2>
        {
          selectedPropertyTypes.isEmpty()
            ? (
              <p>
                No PropertyTypes selected
              </p>
            )
            : (
              <AbstractTypeDataTable
                  abstractTypes={selectedPropertyTypes.toList()}
                  maxHeight={400}
                  workingAbstractTypeType={AbstractTypes.PropertyType}
                  onAbstractTypeSelect={this.removeFromSelectedPropertyTypes} />
            )
        }
        {
          this.renderSelectFromAvailableAbstractTypes(
            availablePropertyTypes.toList(),
            AbstractTypes.PropertyType,
            'Available PropertyTypes...',
            this.addToSelectedPropertyTypes
          )
        }
      </PropertyTypesSection>
    );
  }

  renderAssociationTypeSourceEntityTypesSelectSection = () => {

    const { entityTypes, workingAbstractTypeType } = this.props;
    const { selectedSourceEntityTypes } = this.state;

    // only render if we're creating a new AssociationType
    if (workingAbstractTypeType !== AbstractTypes.AssociationType) {
      return null;
    }

    return (
      <section>
        <h2>
          Source EntityTypes
        </h2>
        {
          selectedSourceEntityTypes.isEmpty()
            ? (
              <p>
                No Source EntityTypes selected
              </p>
            )
            : (
              <AbstractTypeDataTable
                  abstractTypes={selectedSourceEntityTypes.toList()}
                  maxHeight={400}
                  workingAbstractTypeType={AbstractTypes.EntityType}
                  onAbstractTypeSelect={this.removeFromSelectedSourceEntityTypes} />
            )
        }
        {
          this.renderSelectFromAvailableAbstractTypes(
            entityTypes,
            AbstractTypes.EntityType,
            'Available EntityTypes...',
            this.addToSelectedSourceEntityTypes,
          )
        }
      </section>
    );
  }

  renderAssociationTypeDestinationEntityTypesSelectSection = () => {

    const { entityTypes, workingAbstractTypeType } = this.props;
    const { selectedDestinationEntityTypes } = this.state;

    // only render if we're creating a new AssociationType
    if (workingAbstractTypeType !== AbstractTypes.AssociationType) {
      return null;
    }

    return (
      <section>
        <h2>
          Destination EntityTypes
        </h2>
        {
          selectedDestinationEntityTypes.isEmpty()
            ? (
              <p>
                No Destination EntityTypes selected
              </p>
            )
            : (
              <AbstractTypeDataTable
                  abstractTypes={selectedDestinationEntityTypes.toList()}
                  maxHeight={400}
                  workingAbstractTypeType={AbstractTypes.EntityType}
                  onAbstractTypeSelect={this.removeFromSelectedDestinationEntityTypes} />
            )
        }
        {
          this.renderSelectFromAvailableAbstractTypes(
            entityTypes,
            AbstractTypes.EntityType,
            'Available EntityTypes...',
            this.addToSelectedDestinationEntityTypes,
          )
        }
      </section>
    );
  }

  render() {

    const { onCancel, workingAbstractTypeType } = this.props;

    // TODO: check values against exisitng data to notify the user in realtime

    let title :string;
    switch (workingAbstractTypeType) {
      case AbstractTypes.AssociationType:
        title = 'Create new AssociationType';
        break;
      case AbstractTypes.EntityType:
        title = 'Create new EntityType';
        break;
      case AbstractTypes.PropertyType:
        title = 'Create new PropertyType';
        break;
      case AbstractTypes.Schema:
        title = 'Create new Schema';
        break;
      default:
        title = 'Create new...';
        break;
    }

    return (
      <AbstractTypeCreateCard>
        <h1>
          { title }
        </h1>
        <section>
          {
            this.renderAbstractTypeInputField(
              'text',
              'Namespace',
              this.handleOnChangeNamespace,
              this.handleOnEditToggleNamespace,
            )
          }
        </section>
        <section>
          {
            this.renderAbstractTypeInputField(
              'text',
              'Name',
              this.handleOnChangeName,
              this.handleOnEditToggleName,
            )
          }
        </section>
        { this.renderTitleSection() }
        { this.renderDescriptionSection() }
        { this.renderPropertyTypeDataTypeSelectSection() }
        { this.renderPropertyTypeAnalyzerTypeSelectSection() }
        { this.renderPropertyTypeIndexTypeSelectSection() }
        { this.renderPropertyTypePiiSection() }
        { this.renderPropertyTypeMultiValuedSection() }
        { this.renderAssociationTypeBidirectionalSection() }
        { this.renderEntityTypePrimaryKeyPropertyTypesSelectSection() }
        { this.renderEntityTypePropertyTypesSelectSection() }
        { this.renderAssociationTypeSourceEntityTypesSelectSection() }
        { this.renderAssociationTypeDestinationEntityTypesSelectSection() }
        <ActionButtons>
          {
            (this.isReadyToSubmit())
              ? (
                <StyledButton onClick={this.submitCreateAbstractTypeRequest}>
                  Create
                </StyledButton>
              )
              : (
                <StyledButton disabled>
                  Create
                </StyledButton>
              )
          }
          <StyledButton onClick={onCancel}>
            Cancel
          </StyledButton>
        </ActionButtons>
      </AbstractTypeCreateCard>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  associationTypes: state.getIn(['edm', 'associationTypes', 'associationTypes']),
  entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes']),
  propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes']),
});

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    localCreateAssociationType: AssociationTypesActions.localCreateAssociationType,
    localCreateEntityType: EntityTypesActions.localCreateEntityType,
    localCreatePropertyType: PropertyTypesActions.localCreatePropertyType,
    localCreateSchema: SchemasActions.localCreateSchema,
  }, dispatch)
});

export default connect<*, *, *, *, *, *>(mapStateToProps, mapDispatchToProps)(AbstractTypeCreateContainer);
