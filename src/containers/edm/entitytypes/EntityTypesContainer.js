/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import { Models } from 'lattice';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AbstractDataTable from '../../../components/datatable/AbstractDataTable';
import StyledFlexComponent from '../../../components/flex/StyledFlexComponent';

import {
  StyledCard,
  StyledCardSection,
  StyledCardSectionBody,
  StyledCardSectionTitle,
  StyledCardTitle
} from '../../../components/cards/StyledCard';

import { fetchAllEntityTypesRequest } from './EntityTypesActionFactory';

const { FullyQualifiedName } = Models;

const Wrapper = StyledFlexComponent.extend`
  align-items: flex-start;
  justify-content: space-evenly;
`;

const AllEntityTypesCard = StyledCard.extend`
  min-width: 500px;
`;

const EntityTypeDetailsCard = StyledCard.extend`
  width: 500px;
`;

type Props = {
  actions :{
    fetchAllEntityTypesRequest :Function
  },
  entityTypes :List<Map<*, *>>,
  filterQuery :string
};

type State = {
  filteredEntityTypes :List<Map<*, *>>,
  selectedIndex :number
};

class EntityTypesContainer extends React.Component<Props, State> {

  static defaultProps = {
    actions: {},
    entityTypes: Immutable.List(),
    filterQuery: ''
  };

  constructor(props :Props) {

    super(props);

    const filteredEntityTypes :List<Map<*, *>> = EntityTypesContainer.filterEntityTypes(
      props.entityTypes,
      props.filterQuery
    );

    this.state = {
      filteredEntityTypes,
      selectedIndex: 0
    };
  }

  static filterEntityTypes(entityTypes :List<Map<*, *>>, filterQuery :?string) :List<Map<*, *>> {

    return entityTypes.filter((entityType :Map<*, *>) => {

      const ptType :Map<string, string> = entityType.get('type', Immutable.Map());
      const ptFQN :string = (new FullyQualifiedName(ptType.toJS())).getFullyQualifiedName();
      const ptTitle :string = entityType.get('title', '');

      let includeEntityType :boolean = true;
      if (filterQuery && filterQuery.trim()) {
        const matchesFQN :boolean = ptFQN.includes(filterQuery.trim());
        const matchesTitle :boolean = ptTitle.includes(filterQuery.trim());
        if (!matchesFQN && !matchesTitle) {
          includeEntityType = false;
        }
      }

      return includeEntityType;
    });
  }

  componentDidMount() {

    this.props.actions.fetchAllEntityTypesRequest();
  }

  componentWillReceiveProps(nextProps :Props) {

    // TODO: potential bug with using nextProps.entityTypes
    const filteredEntityTypes :List<Map<*, *>> = EntityTypesContainer.filterEntityTypes(
      nextProps.entityTypes,
      nextProps.filterQuery
    );

    // TODO: might have weird/unexpected behavior by resetting selectedIndex
    this.setState({
      filteredEntityTypes,
      selectedIndex: 0
    });
  }

  renderDataTable = () => {

    // TODO: make this better
    const headers :Object[] = [
      { id: 'type', value: 'FQN' },
      { id: 'title', value: 'Title' }
    ];

    const data :List<Map<string, string>> = this.state.filteredEntityTypes.map((entityType :Map<*, *>) => {

      const ptType :Map<string, string> = entityType.get('type', Immutable.Map());
      const ptFQN :string = (new FullyQualifiedName(ptType.toJS())).getFullyQualifiedName();
      const ptTitle :string = entityType.get('title', '');

      return Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {
        map.set('type', ptFQN);
        map.set('title', ptTitle);
      });
    });

    const onClick :Function = (selectedRowIndex :number) => {
      this.setState({
        selectedIndex: selectedRowIndex
      });
    };

    return (
      <div>
        {
          data.isEmpty()
            ? (<div>No EntityTypes</div>)
            : null
        }
        <AbstractDataTable
            data={data}
            headers={Immutable.fromJS(headers)}
            onRowClick={onClick}
            maxHeight={600}
            maxWidth={700}
            width={700} />
      </div>
    );
  }

  renderEntityTypesTable = () => {

    return (
      <AllEntityTypesCard>
        <StyledCardTitle>EDM EntityTypes</StyledCardTitle>
        <StyledCardSection>
          <StyledCardSectionBody>
            { this.renderDataTable() }
          </StyledCardSectionBody>
        </StyledCardSection>
      </AllEntityTypesCard>
    );
  }

  renderEntityTypeDetails = () => {

    if (this.state.selectedIndex < 0) {
      return null;
    }

    const entityType :Map<*, *> = this.state.filteredEntityTypes.get(this.state.selectedIndex, Immutable.Map());
    if (!entityType || entityType.isEmpty()) {
      return null;
    }

    const ptType :Map<string, string> = entityType.get('type', Immutable.Map());
    const fqnAsString :string = `${new FullyQualifiedName(ptType.toJS())}`;

    const ptKey :List<*> = entityType.get('key', Immutable.List());
    const keyAsString :string = ptKey.isEmpty() ? '[]' : ptKey.toString();

    const ptProperties :List<*> = entityType.get('properties', Immutable.List());
    const propertiesAsString :string = ptProperties.isEmpty() ? '[]' : ptProperties.toString();

    const ptSchemas :List<*> = entityType.get('schemas', Immutable.List());
    const schemasAsString :string = ptSchemas.isEmpty() ? '[]' : ptSchemas.toString();

    return (
      <EntityTypeDetailsCard>
        <StyledCardTitle>EntityType Details</StyledCardTitle>
        <StyledCardSection>
          <StyledCardSectionTitle>ID</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ entityType.get('id') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Type</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ fqnAsString }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Title</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ entityType.get('title') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Description</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ entityType.get('description') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>BaseType</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ entityType.get('baseType') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Category</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ entityType.get('category') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Key</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ keyAsString }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Properties</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ propertiesAsString }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Schemas</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ schemasAsString }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
      </EntityTypeDetailsCard>
    );
  }

  render() {

    if (this.props.entityTypes.isEmpty()) {
      return null;
    }

    return (
      <Wrapper>
        { this.renderEntityTypesTable() }
        { this.renderEntityTypeDetails() }
      </Wrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes'], Immutable.List())
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    fetchAllEntityTypesRequest
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityTypesContainer);
