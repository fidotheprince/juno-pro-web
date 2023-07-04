import { React, useState, useEffect } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';;
import {  Page,
          Layout, 
          LegacyCard, 
          Button, 
          Text,
          DataTable,
        } from "@shopify/polaris";
import Counters from '../components/Counters';




function MyComponent() {

/*
  This component dynamically updates a table of customer points associated with a qrCode. 
*/

  //useState for customer points
  const [qrPoints, setQRPoints] = useState([]);
  const [qrCodes, setQRCodes] = useState([]); //useState for QR codes
  const fetch = useAuthenticatedFetch();

  //useEffect to fetch customer points from API
  useEffect(() => {

    //fetch existing QR codes from API using the fetch function
    const fetchQRCodes = async () => {

      const url = `/api/qrcodes`;
      const method = 'GET';

      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });

      if (response.ok) {
        
        const data = await response.json();
        
        //qrCodes customer points exists in this data varable
        setQRPoints(data.qrCodePoints);
        //set data to local state
        setQRCodes(data.qrCodes);

      }
    }

    fetchQRCodes();

  }, []);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <LegacyCard 
            sectioned 
            background="bg-subdued"
          >
            <Text variant="headingLg" as="h5" alignment="center">
            Add customer loyalty points to your QRCodes.
            </Text>
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

                        /*
                          each qrCode is an array which represents a row in the DataTable component
                          this array corresponds with the columnContentTypes array
                          and also the headings array, which sets the type of data
                          and the heading associated with a given column

                          fetchQRCodes is drilled into the Counters component so that the table can be updated
                        */
                        
                        //grab the points object from the qrPoints array {qrCodeID: 9, points: 7}
                        let pointsObect = qrPoints.find(qrCodePointsObject => qrCodePointsObject.qrCodeID === qrCode.id);

                        //if there is a points object for this qrCode then destructure the points property
                        if(pointsObect) {

                          let { points } = pointsObect;

                          //drill points into the Counters component along with the id of the qrCode
                          return [
                            qrCode.title,
                            <Counters
                              points={points}  
                              qrCodeID={qrCode.id}
                            />
                          ]

                        }

                        //if there is no points object then set points to 0
                        return [
                          qrCode.title,
                          <Counters
                            points={0}  
                            qrCodeID={qrCode.id} 
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
