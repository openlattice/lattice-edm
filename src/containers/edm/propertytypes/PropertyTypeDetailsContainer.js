/*
 * @flow
 */

import React from 'react';

import Immutable from 'immutable';
import { Models } from 'lattice';

const { FullyQualifiedName } = Models;

/*
 * types
 */

type Props = {
  propertyType :Map<*, *>
}

const PropertyTypeDetailsContainer = (props :Props) => {

  if (!props.propertyType || props.propertyType.isEmpty()) {
    return null;
  }

  const ptType :Map<string, string> = props.propertyType.get('type', Immutable.Map());
  const fqnAsString :string = FullyQualifiedName.toString(ptType);

  const ptSchemas :List<*> = props.propertyType.get('schemas', Immutable.List());
  const schemasAsString :string = ptSchemas.isEmpty() ? '[]' : ptSchemas.toString();

  const ptPII :boolean = props.propertyType.get('piiField', false);
  const piiAsString :string = `${ptPII}`;

  return (
    <div>
      <h1>PropertyType Details</h1>
      <section>
        <h2>ID</h2>
        <p>{ props.propertyType.get('id') }</p>
      </section>
      <section>
        <h2>Type</h2>
        <p>{ fqnAsString }</p>
      </section>
      <section>
        <h2>Title</h2>
        <p>{ props.propertyType.get('title') }</p>
      </section>
      <section>
        <h2>Description</h2>
        <p>{ props.propertyType.get('description') }</p>
      </section>
      <section>
        <h2>DataType</h2>
        <p>{ props.propertyType.get('datatype') }</p>
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
        <p>{ props.propertyType.get('analyzer') }</p>
      </section>
    </div>
  );
};

export default PropertyTypeDetailsContainer;
