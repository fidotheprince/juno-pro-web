import {React, useState} from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { ButtonGroup, Button, Text, HorizontalGrid} from "@shopify/polaris";


//drilled qrCodeId from QRCodeIndex.jsx
function Counters({qrCodeID}) {

    const [customerPoints, setPoints] = useState(0);
    const fetch = useAuthenticatedFetch();

    //save points to API using the fetch function
    const onSubmit = async () => {

        //host is added here to bypass shopify.ensureInstalledOnShop() in the backend
        const host = `host=${window.__SHOPIFY_DEV_HOST}`
        const url = `/api/storepoints?${host}`;
        const method = 'POST';
        const body = JSON.stringify({ qrCodeID, customerPoints });

        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
        }
    }

    return (
        <HorizontalGrid gap="4">
            <Text>
                Customer Points: {customerPoints}
            </Text>
            <ButtonGroup>
                <Button onClick={()=>{setPoints(customerPoints + 1)}}>+</Button>
                <Button onClick={()=>{setPoints(customerPoints - 1)}}>-</Button>
                <Button primary onClick={onSubmit}>Save</Button>
            </ButtonGroup>
        </HorizontalGrid>
    );
  }
  
  export default Counters;