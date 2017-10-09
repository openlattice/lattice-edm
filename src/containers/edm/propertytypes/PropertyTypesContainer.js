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

import { fetchAllPropertyTypesRequest } from './PropertyTypesActionFactory';

const { FullyQualifiedName } = Models;

const Wrapper = StyledFlexComponent.extend`
  align-items: flex-start;
  justify-content: space-evenly;
`;

const AllPropertyTypesCard = StyledCard.extend`
  min-width: 500px;
`;

const PropertyTypeDetailsCard = StyledCard.extend`
  width: 500px;
`;

type Props = {
  actions :{
    fetchAllPropertyTypesRequest :Function
  },
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

      const ptType :Map<string, string> = propertyType.get('type', Immutable.Map());
      const ptFQN :string = (new FullyQualifiedName(ptType.toJS())).getFullyQualifiedName();
      const ptTitle :string = propertyType.get('title', '');

      let includePropertyType :boolean = true;
      if (filterQuery && filterQuery.trim()) {
        const matchesFQN :boolean = ptFQN.includes(filterQuery.trim());
        const matchesTitle :boolean = ptTitle.includes(filterQuery.trim());
        if (!matchesFQN && !matchesTitle) {
          includePropertyType = false;
        }
      }

      return includePropertyType;
    });
  }

  componentDidMount() {

    this.props.actions.fetchAllPropertyTypesRequest();
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

  renderDataTable = () => {

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
      <div>
        {
          data.isEmpty()
            ? (<div>No PropertyTypes</div>)
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

  renderPropertyTypeTable = () => {

    return (
      <AllPropertyTypesCard>
        <StyledCardTitle>EDM PropertyTypes</StyledCardTitle>
        <StyledCardSection>
          <StyledCardSectionBody>
            { this.renderDataTable() }
          </StyledCardSectionBody>
        </StyledCardSection>
      </AllPropertyTypesCard>
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
        <StyledCardTitle>PropertyType Details</StyledCardTitle>
        <StyledCardSection>
          <StyledCardSectionTitle>ID</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ propertyType.get('id') }</p>
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
            <p>{ propertyType.get('title') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Description</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ propertyType.get('description') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>DataType</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ propertyType.get('datatype') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Schemas</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ schemasAsString }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>PII</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ piiAsString }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
        <StyledCardSection>
          <StyledCardSectionTitle>Analyzer</StyledCardSectionTitle>
          <StyledCardSectionBody>
            <p>{ propertyType.get('analyzer') }</p>
          </StyledCardSectionBody>
        </StyledCardSection>
      </PropertyTypeDetailsCard>
    );
  }

  render() {

    if (this.props.propertyTypes.isEmpty()) {
      return null;
    }

    return (
      <Wrapper>
        { this.renderPropertyTypeTable() }
        { this.renderPropertyTypeDetails() }
      </Wrapper>
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
