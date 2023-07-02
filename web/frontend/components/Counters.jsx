import {React, useState} from "react";
import { ButtonGroup, Button } from "@shopify/polaris";



function Counters({customerPoints, setPoints}) {

    return (
        <ButtonGroup>
            <Button onClick={()=>{setPoints(customerPoints + 1)}}>+</Button>
            <Button onClick={()=>{setPoints(customerPoints - 1)}}>-</Button>
        </ButtonGroup>
    );
  }
  
  export default Counters;