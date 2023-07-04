import {React, useState} from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { ButtonGroup, Button, Text, HorizontalGrid} from "@shopify/polaris";
import { use } from "i18next";
import { show } from "@shopify/app-bridge/actions/ContextualSaveBar";


//drilled qrCodeId from QRCodeIndex.jsx
function Counters({qrCodeID, points}) {
    
    
    //points is the customer points since the last time the value was saved
    //if a QRCode has never been assigned points, then the value is 0
    const [customerPoints, setPoints] = useState(points);
    const [showUDButtons, setUDButtons] = useState(false);
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
            //shows update and delete buttons
            setUDButtons(true);
            console.log(data);
        }
    }

    const onUpdate = async () => {
        const host = `host=${window.__SHOPIFY_DEV_HOST}`
        const url = `/api/updatepoints/${qrCodeID}?${host}`;
        const method = 'PUT';
        const body = JSON.stringify({ customerPoints });

        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
        if (response.ok) {
            const data = await response.json();
            console.log(data);
        }
    }

    const onDelete = async () => {
        const host = `host=${window.__SHOPIFY_DEV_HOST}`
        const url = `/api/deletepoints/${qrCodeID}?${host}`;
        const method = 'DELETE';

        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });
        //hides update and delete buttons
        setUDButtons(false);
        


        if (response.ok) {
            setPoints(0);
            const data = await response.json();
            console.log(data);
        }
    }


    return (
        <HorizontalGrid gap="4">
            <Text>
                {showUDButtons ? `Current Points: ${customerPoints}` : `Customer Points: ${customerPoints}`}
            </Text>
            <ButtonGroup>
                <Button onClick={()=>{setPoints(customerPoints + 1)}}>+</Button>
                <Button onClick={()=>{setPoints(customerPoints - 1)}}>-</Button>
                {
                    showUDButtons
                    ? 
                    <>
                        <Button primary onClick={onUpdate}>
                            Save
                        </Button>
                        <Button style={{paddingLeft: '2px'}} onClick={onDelete}>
                            Reset
                        </Button>
                    </>
                    : 
                    <Button primary onClick={onSubmit}>
                        Save
                    </Button>
                }
            </ButtonGroup>
        </HorizontalGrid>
    );

}

  
  export default Counters;