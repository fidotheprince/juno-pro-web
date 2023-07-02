/*
  The custom REST API to support the app frontend.
  Handlers combine application data from qr-codes-db.js with helpers to merge the Shopify GraphQL Admin API data.
  The Shop is the Shop that the current user belongs to. For example, the shop that is using the app.
  This information is retrieved from the Authorization header, which is decoded from the request.
  The authorization header is added by App Bridge in the frontend code.

  In very simple words, the REST API is a way for the frontend to communicate with the backend.
*/

import express from "express";
import shopify from "../shopify.js";
import { QRCodesDB } from "../qr-codes-db.js";
import {
  getQrCodeOr404,
  getShopUrlFromSession,
  parseQrCodeBody,
  formatQrCodeResponse,
} from "../helpers/qr-codes.js";

const SHOP_DATA_QUERY = `
  query shopData($first: Int!) {
    shop {
      url
    }
    codeDiscountNodes(first: $first) {
      edges {
        node {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
            ... on DiscountCodeBxgy {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
            ... on DiscountCodeFreeShipping {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default function applyQrCodeApiEndpoints(app) {
  app.use(express.json()); 
 

  app.get("/api/shop-data", async (req, res) => {
    //client is an instance of the Shopify GraphQL Admin API client
    //the client requires a session value
    const client = new shopify.api.clients.Graphql({
      session: res.locals.shopify.session,
    });

    /* Fetch shop data, including all available discounts to list in the QR code form */
    const shopData = await client.query({
      data: {
        query: SHOP_DATA_QUERY,
        variables: {
          first: 25,
        },
      },
    });

    res.send(shopData.body.data);
  });

  app.post("/api/qrcodes", async (req, res) => {

    try {
      //creates a new QR code and returns the id of the new QR code
      //invokes the create method from qr-codes-db.js
      const id = await QRCodesDB.create({
        ...(await parseQrCodeBody(req)),

        /* Get the shop from the authorization header to prevent users from spoofing the data */
        shopDomain: await getShopUrlFromSession(req, res),
      });
      const response = await formatQrCodeResponse(req, res, [
        await QRCodesDB.read(id),
      ]);
      res.status(201).send(response[0]);
    } catch (error) {
      res.status(500).send(error.message, 'something went wrong! on the entry');
    }
  });

  app.patch("/api/qrcodes/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      try {
        await QRCodesDB.update(req.params.id, await parseQrCodeBody(req));
        const response = await formatQrCodeResponse(req, res, [
          await QRCodesDB.read(req.params.id),
        ]);
        res.status(200).send(response[0]);
      } catch (error) {
        res.status(500).send(error.message);
      }
    }
  });

  app.put("/api/updatepoints/:id", async (req, res) => {
    const { id } = req.params;
    const { customerPoints } = req.body;
    const points = customerPoints;
    const qrCodeID = id;
    try {
      const response = await QRCodesDB.updateCustomerPoints(qrCodeID, points);
      res.status(200).send({success: response, updated: ` qrCodeID: ${id} is now associated with ${points} loyalty points`});
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  //returns a list of all QR codes, which is used in the QRCodeIndex.js file
  app.get("/api/qrcodes", async (req, res) => {
    try {
      const rawCodeData = await QRCodesDB.list(
        await getShopUrlFromSession(req, res)
      );

      //database response for the points table and the qr codes table
      const qrCodePoints = await QRCodesDB.listCustomerPoints(); // will attempt to read an non-existing table if table is not initialized prior to this call
      const qrCodes = await formatQrCodeResponse(req, res, rawCodeData);

      res.status(200).send({qrCodes, qrCodePoints});
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/qrcodes/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      const formattedQrCode = await formatQrCodeResponse(req, res, [qrcode]);
      res.status(200).send(formattedQrCode[0]);
    }
  });

  app.delete("/api/qrcodes/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      await QRCodesDB.delete(req.params.id);
      res.status(200).send();
    }
  });



  app.delete("/api/deletepoints/:id", async (req, res) => {
    const { id } = req.params;
    const qrCodeID = id;
    try {
      const response = await QRCodesDB.deleteCustomerPoints(qrCodeID);
      res.status(200).send({success: response, deleted: ` qrCodeID: ${qrCodeID} has been deleted`});
    } catch (error) {
      res.status(500).send(error.message);
    }
  })
  //endpoint used to check retrieve all QRCodes and they loyalty points
  app.get("/api/points", async (req, res) => {

    let response;
    let status = 200;
    let error = null;

    try {
      response = await QRCodesDB.listCustomerPoints()
    } catch (err) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }

    res.status(status).send({ 
      success: status === 200,
      message: response, 
      error,
    });
    
  });

//endpoint used to store the points of QR code
app.post("/api/storepoints", async (req, res) => {

  let response;
  let createResponse;
  let status = 200;
  let error = null;

  try {
    //initializes the points table if it doesn't exist
    response = await QRCodesDB.initPointsTable();
    //creates a new row in the points table
    createResponse = await QRCodesDB.createPointsRow(req.body);


  } catch (err) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }

  res.status(status).send({ 
    success: status === 200, 
    error,
    message: [ 'Points stored successfully', {table: response, createResponse} ]
  });

});
  
}
