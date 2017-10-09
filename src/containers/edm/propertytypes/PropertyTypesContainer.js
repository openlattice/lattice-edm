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
  width: 800px;
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
  filterQuery :string,
  selectedPropertyTypeIndex :number
};

class PropertyTypesContainer extends React.Component<Props, State> {

  static defaultProps = {
    actions: {},
    propertyTypes: Immutable.List(),
    filterQuery: ''
  };

  constructor(props :Props) {

    super(props);

    this.state = {
      filterQuery: props.filterQuery || '',
      selectedPropertyTypeIndex: 0
    };
  }

  componentDidMount() {

    this.props.actions.fetchAllPropertyTypesRequest();
  }

  componentWillReceiveProps(nextProps :Props) {

    this.setState({ filterQuery: nextProps.filterQuery });
  }

  renderAbstractTypeTable = () => {

    // TODO: make this better
    const headers :Object[] = [
      { id: 'type', value: 'FQN' },
      { id: 'title', value: 'Title' }
    ];

    const data = this.props.propertyTypes.reduce(
      (propertyTypes :List<Map<string, string>>, propertyType :Map<*, *>) => {

        const ptType :Map<string, string> = propertyType.get('type', Immutable.Map());
        const ptFQN :string = (new FullyQualifiedName(ptType.toJS())).getFullyQualifiedName();
        const ptTitle :string = propertyType.get('title', '');

        let includePropertyType :boolean = true;
        if (this.state.filterQuery && this.state.filterQuery !== '*') {
          const matchesFQN :boolean = ptFQN.includes(this.state.filterQuery);
          const matchesTitle :boolean = ptTitle.includes(this.state.filterQuery);
          if (!matchesFQN && !matchesTitle) {
            includePropertyType = false;
          }
        }

        if (includePropertyType) {
          return propertyTypes.push(
            Immutable.OrderedMap().withMutations((map :OrderedMap<string, string>) => {
              map.set('type', ptFQN);
              map.set('title', ptTitle);
            })
          );
        }

        return propertyTypes;
      },
      Immutable.List()
    );

    const onClick :Function = (selectedRowIndex :number) => {
      this.setState({
        selectedPropertyTypeIndex: selectedRowIndex
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
            width={700}
            recomputeDimensionsWhenPropsChange={false} />
      </div>
    );
  }

  renderPropertyTypeTable = () => {

    return (
      <AllPropertyTypesCard>
        <StyledCardTitle>EDM PropertyTypes</StyledCardTitle>
        <StyledCardSection>
          <StyledCardSectionBody>
            { this.renderAbstractTypeTable() }
          </StyledCardSectionBody>
        </StyledCardSection>
      </AllPropertyTypesCard>
    );
  }

  renderPropertyTypeDetails = () => {

    if (this.state.selectedPropertyTypeIndex < 0) {
      return null;
    }

    const propertyType :Map<*, *> = this.props.propertyTypes.get(this.state.selectedPropertyTypeIndex);

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
