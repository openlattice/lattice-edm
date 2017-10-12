/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import styled from 'styled-components';
import { Models } from 'lattice';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AbstractDataTable from '../../../components/datatable/AbstractDataTable';

import { StyledCard } from '../../../components/cards/StyledCard';

import { fetchAllPropertyTypesRequest } from './PropertyTypesActionFactory';

const { FullyQualifiedName } = Models;

const PTContainerWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
`;

const PropertyTypesCard = StyledCard.extend`
  flex: 1 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

const PropertyTypeDetailsCard = StyledCard.extend`
  flex: 3 0 auto;
  max-width: 1000px;
  min-width: 500px;
`;

type Props = {
  propertyTypes :List<Map<*, *>>,
  filterQuery :string
};

type State = {
  filteredPropertyTypes :List<Map<*, *>>,
  selectedIndex :number
};

class PropertyTypesContainer extends React.Component<Props, State> {

  static defaultProps = {
    actions: {},
    propertyTypes: Immutable.List(),
    filterQuery: ''
  };

  constructor(props :Props) {

    super(props);

    const filteredPropertyTypes :List<Map<*, *>> = PropertyTypesContainer.filterPropertyTypes(
      props.propertyTypes,
      props.filterQuery
    );

    this.state = {
      filteredPropertyTypes,
      selectedIndex: 0
    };
  }

  static filterPropertyTypes(propertyTypes :List<Map<*, *>>, filterQuery :?string) :List<Map<*, *>> {

    return propertyTypes.filter((propertyType :Map<*, *>) => {

      const propertyTypeId :string = propertyType.get('id');
      const ptType :Map<string, string> = propertyType.get('type', Immutable.Map());
      const ptFQN :string = (new FullyQualifiedName(ptType.toJS())).getFullyQualifiedName();
      const ptTitle :string = propertyType.get('title', '');

      let includePropertyType :boolean = true;
      if (filterQuery && filterQuery.trim()) {
        const matchesId :boolean = (propertyTypeId === filterQuery);
        const matchesFQN :boolean = ptFQN.includes(filterQuery.trim());
        const matchesTitle :boolean = ptTitle.includes(filterQuery.trim());
        if (!matchesId && !matchesFQN && !matchesTitle) {
          includePropertyType = false;
        }
      }

      return includePropertyType;
    });
  }

  componentWillReceiveProps(nextProps :Props) {

    // TODO: potential bug with using nextProps.propertyTypes
    const filteredPropertyTypes :List<Map<*, *>> = PropertyTypesContainer.filterPropertyTypes(
      nextProps.propertyTypes,
      nextProps.filterQuery
    );

    // TODO: might have weird/unexpected behavior by resetting selectedIndex
    this.setState({
      filteredPropertyTypes,
      selectedIndex: 0
    });
  }

  renderPropertyTypesDataTable = () => {

    // TODO: make this better
    const headers :Object[] = [
      { id: 'type', value: 'FQN' },
      { id: 'title', value: 'Title' }
    ];

    const data :List<Map<string, string>> = this.state.filteredPropertyTypes.map((propertyType :Map<*, *>) => {

      const ptType :Map<string, string> = propertyType.get('type', Immutable.Map());
      const ptFQN :string = (new FullyQualifiedName(ptType.toJS())).getFullyQualifiedName();
      const ptTitle :string = propertyType.get('title', '');

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
      <PropertyTypesCard>
        <h1>EDM PropertyTypes</h1>
        {
          data.isEmpty()
            ? (<div>No PropertyTypes</div>)
            : null
        }
        <AbstractDataTable
            data={data}
            headers={Immutable.fromJS(headers)}
            onRowClick={onClick}
            maxHeight={600} />
      </PropertyTypesCard>
    );
  }

  renderPropertyTypeDetails = () => {

    if (this.state.selectedIndex < 0) {
      return null;
    }

    const propertyType :Map<*, *> = this.state.filteredPropertyTypes.get(this.state.selectedIndex, Immutable.Map());
    if (!propertyType || propertyType.isEmpty()) {
      return null;
    }

    const ptType :Map<string, string> = propertyType.get('type', Immutable.Map());
    const fqnAsString :string = `${new FullyQualifiedName(ptType.toJS())}`;

    const ptSchemas :List<*> = propertyType.get('schemas', Immutable.List());
    const schemasAsString :string = ptSchemas.isEmpty() ? '[]' : ptSchemas.toString();

    const ptPII :boolean = propertyType.get('piiField', false);
    const piiAsString :string = `${ptPII}`;

    return (
      <PropertyTypeDetailsCard>
        <h1>PropertyType Details</h1>
        <section>
          <h2>ID</h2>
          <p>{ propertyType.get('id') }</p>
        </section>
        <section>
          <h2>Type</h2>
          <p>{ fqnAsString }</p>
        </section>
        <section>
          <h2>Title</h2>
          <p>{ propertyType.get('title') }</p>
        </section>
        <section>
          <h2>Description</h2>
          <p>{ propertyType.get('description') }</p>
        </section>
        <section>
          <h2>DataType</h2>
          <p>{ propertyType.get('datatype') }</p>
        </section>
        <section>
          <h2>Schemas</h2>
          <p>{ schemasAsString }</p>
        </section>
        <section>
          <h2>PII</h2>
          <p>{ piiAsString }</p>
        </section>
        <section>
          <h2>Analyzer</h2>
          <p>{ propertyType.get('analyzer') }</p>
        </section>
      </PropertyTypeDetailsCard>
    );
  }

  render() {

    if (this.props.propertyTypes.isEmpty()) {
      return null;
    }

    return (
      <PTContainerWrapper>
        { this.renderPropertyTypesDataTable() }
        { this.renderPropertyTypeDetails() }
      </PTContainerWrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {

  return {
    propertyTypes: state.getIn(['edm', 'propertyTypes', 'propertyTypes'], Immutable.List())
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  const actions = {
    fetchAllPropertyTypesRequest
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PropertyTypesContainer);
