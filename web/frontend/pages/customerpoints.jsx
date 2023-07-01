import { React, useState } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';;
import { Page, Layout, LegacyCard, Button} from "@shopify/polaris";




function MyComponent() {

/*
  This component dynamically updates a table of customer points anytime a customer makes a purchase
  using a QR code. It identifies once a customer has reached 10 points. 

  For a final project, this component would be used to create a rewards program for customers. Here you'd notify the
  customer and send them a discount code for a free product. 
*/
  //useState for customer points
  const [customerPoints, setPoints] = useState(0);
  const fetch = useAuthenticatedFetch();

  //fetch data points data from API using the fetch function
  const onSubmit = async () => {

    //host is added here to bypass shopify.ensureInstalledOnShop() in the backend
    const host = `host=${window.__SHOPIFY_DEV_HOST}`
    const url = `/api/points?${host}`;
    const method = 'GET';

    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });

    if (response.ok) {
      const data = await response.json();
      const { points } = data.asset;
      setPoints(points + customerPoints);
    } 

  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned title="Point Distributions">
            <Button onClick={onSubmit}>Customer Points: {customerPoints}</Button>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default MyComponent;
