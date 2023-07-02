import {React, useState} from "react";
import { ButtonGroup, Button, Text, HorizontalGrid} from "@shopify/polaris";



function Counters() {

    const [customerPoints, setPoints] = useState(0);

    return (
        <HorizontalGrid gap="4">
            <Text>
                Customer Points: {customerPoints}
            </Text>
            <ButtonGroup>
                <Button onClick={()=>{setPoints(customerPoints + 1)}}>+</Button>
                <Button onClick={()=>{setPoints(customerPoints - 1)}}>-</Button>
                <Button primary>Save</Button>
            </ButtonGroup>
        </HorizontalGrid>
    );
  }
  
  export default Counters;