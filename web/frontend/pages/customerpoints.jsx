import { React, useState } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';;
import {  Page,
          Layout, 
          LegacyCard, 
          Button, 
          Text,
          ButtonGroup,
          DataTable,
        } from "@shopify/polaris";
import Counters from '../components/Counters';




function MyComponent() {

/*
  This component dynamically updates a table of customer points anytime a customer makes a purchase
  using a QR code. It identifies once a customer has reached 10 points. 

  For a final project, this component would be used to create a rewards program for customers. Here you'd notify the
  customer and send them a discount code for a free product. 
*/
  //useState for customer points
  const [customerPoints, setPoints] = useState(0);
  const [qrCodes, setQRCodes] = useState([]); //useState for QR codes
  const [rows, setRows] = useState([]);
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

  //fetch existing QR codes from API using the fetch function
  const fetchQRCodes = async () => {

      const url = `/api/qrcodes`;
      const method = 'GET';
  
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });
  
      if (response.ok) {
        
        const data = await response.json();
        //set data to local state
        setQRCodes(data);

      }
  }

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned title="Add loyalty points to your stores QR Codes">
            <Button onClick={fetchQRCodes}>Get QR Codes</Button>
          </LegacyCard>
          <LegacyCard sectioned title="QR Codes">
               {
                qrCodes.length === 0 
                ? 
                  <Text variant="heading1xl" as="h1">
                    You haven't assigened any loyalty points yet.
                  </Text> 
                :
                  <LegacyCard>
                    <DataTable 
                      hasZebraStripingOnData
                      columnContentTypes={['text', 'text']}
                      headings={['QR Code', 'Add or Remove Points']}
                      rows={qrCodes.map((qrCode) => {
                        //each row is an array of data, the second element is the points
                        //the points are set to 0 for now but will need global state to keep track of points
                        return [
                                  qrCode.title,
                                  <Counters
                                    qrCodeId={qrCode.id} 
                                  />
                        ]
              
                      })}
                    >
                    </DataTable>
                  </LegacyCard>
               }
    
          </LegacyCard>

        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default MyComponent;
