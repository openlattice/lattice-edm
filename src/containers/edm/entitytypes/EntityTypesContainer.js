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
  StyledCardDetail,
  StyledCardSection,
  StyledCardSectionBody,
  StyledCardSectionGroup,
  StyledCardSectionTitle,
  StyledCardTitle
} from '../../../components/cards/StyledCard';

import { fetchAllEntityTypesRequest } from './EntityTypesActionFactory';

const { FullyQualifiedName } = Models;

const Wrapper = StyledFlexComponent.extend`
  align-items: flex-start;
  justify-content: left;
`;

const AllEntityTypesCard = StyledCard.extend`
  min-width: 500px;
`;

type Props = {
  entityTypes :List<Map<*, *>>,
  propertyTypesById :Map<string, Map<*, *>>,
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
    propertyTypesById: Immutable.Map(),
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

  renderEntityTypesDataTable = () => {

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
      <AllEntityTypesCard>
        <StyledCardTitle>EDM EntityTypes</StyledCardTitle>
        <StyledCardSection>
          <StyledCardSectionBody>
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
                maxWidth={600}
                width={600} />
          </StyledCardSectionBody>
        </StyledCardSection>
      </AllEntityTypesCard>
    );
  }

  renderEntityTypePropertiesDataTable = (entityType :Map<*, *>) => {

    // TODO: make this better
    const headers :Object[] = [
      { id: 'pk', value: 'PK' },
      { id: 'type', value: 'FQN' },
      { id: 'title', value: 'Title' }
    ];

    const data :List<Map<string, string>> = entityType.get('properties', Immutable.List())
      .map((propertyTypeId :UUID) => {
        return Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {

          const propertyType :Map<*, *> = this.props.propertyTypesById.get(propertyTypeId, Immutable.Map());
          const ptType :Map<string, string> = propertyType.get('type', Immutable.Map());
          const ptFQN :string = (new FullyQualifiedName(ptType.toJS())).getFullyQualifiedName();
          const ptTitle :string = propertyType.get('title', '');

          const isKey :boolean = entityType.get('key', Immutable.List()).includes(propertyTypeId);

          map.set('pk', isKey ? 'PK' : '');
          map.set('type', ptFQN);
          map.set('title', ptTitle);
        })
      })
      .sort((propertyType) => {
        const primaryKey :string = propertyType.get('pk');
        if (primaryKey === 'PK') {
          return -1;
        }
        else if (primaryKey === '') {
          return 1;
        }
        return 0;
      });

    const onClick :Function = (selectedRowIndex :number) => {
      console.log('I clicked a PropertyType!');
    };

    return (
      <AbstractDataTable
          data={data}
          headers={Immutable.fromJS(headers)}
          onRowClick={onClick}
          maxHeight={400}
          maxWidth={600} />
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

    return (
      <StyledCard>
        <StyledCardTitle>EntityType Details</StyledCardTitle>
        <StyledCardSectionGroup horizontal>
          <StyledCardSection style={{ width: '400px' }}>
            <StyledCardDetail>
              <StyledCardSectionTitle>ID</StyledCardSectionTitle>
              <StyledCardSectionBody>
                <p>{ entityType.get('id') }</p>
              </StyledCardSectionBody>
            </StyledCardDetail>
            <StyledCardDetail>
              <StyledCardSectionTitle>Type</StyledCardSectionTitle>
              <StyledCardSectionBody>
                <p>{ fqnAsString }</p>
              </StyledCardSectionBody>
            </StyledCardDetail>
            <StyledCardDetail>
              <StyledCardSectionTitle>Title</StyledCardSectionTitle>
              <StyledCardSectionBody>
                <p>{ entityType.get('title') }</p>
              </StyledCardSectionBody>
            </StyledCardDetail>
            <StyledCardDetail>
              <StyledCardSectionTitle>Description</StyledCardSectionTitle>
              <StyledCardSectionBody>
                <p>{ entityType.get('description') }</p>
              </StyledCardSectionBody>
            </StyledCardDetail>
            <StyledCardDetail>
              <StyledCardSectionTitle>BaseType</StyledCardSectionTitle>
              <StyledCardSectionBody>
                <p>{ entityType.get('baseType') }</p>
              </StyledCardSectionBody>
            </StyledCardDetail>
            <StyledCardDetail>
              <StyledCardSectionTitle>Category</StyledCardSectionTitle>
              <StyledCardSectionBody>
                <p>{ entityType.get('category') }</p>
              </StyledCardSectionBody>
            </StyledCardDetail>
          </StyledCardSection>
          <StyledCardSection>
            <StyledCardDetail>
              <StyledCardSectionTitle>Properties</StyledCardSectionTitle>
              <StyledCardSectionBody>
                { this.renderEntityTypePropertiesDataTable(entityType) }
              </StyledCardSectionBody>
            </StyledCardDetail>
            <StyledCardDetail>
              <StyledCardSectionTitle>Schemas</StyledCardSectionTitle>
              <StyledCardSectionBody>
                <p>TODO</p>
              </StyledCardSectionBody>
            </StyledCardDetail>
          </StyledCardSection>
        </StyledCardSectionGroup>
      </StyledCard>
    );
  }

  render() {

    if (this.props.entityTypes.isEmpty() || this.props.propertyTypesById.isEmpty()) {
      return null;
    }

    return (
      <Wrapper>
        { this.renderEntityTypesDataTable() }
        { this.renderEntityTypeDetails() }
      </Wrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    entityTypes: state.getIn(['edm', 'entityTypes', 'entityTypes'], Immutable.List()),
    propertyTypesById: state.getIn(['edm', 'propertyTypes', 'propertyTypesById'], Immutable.List())
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
