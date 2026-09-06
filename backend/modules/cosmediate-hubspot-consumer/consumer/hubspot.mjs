import {
  API_ERRORS,
} from "/opt/nodejs/constants/errors/index.mjs";
import {
  httpError,
} from "/opt/nodejs/lib/errors/http-error.mjs";
import Hubspot from "@hubspot/api-client";

import {
  ENTITY_TYPE,
} from "/opt/nodejs/constants/db/entity-types.mjs";
import { getRequestContext } from "/opt/nodejs/lib/context/request-context.mjs";

import { getLeadDataById } from "../db/leads.mjs";

const hubspotClient = new Hubspot.Client({
  accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN,
});

async function findOrCreateContact(email, properties) {
  // 1. search by email
  const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
    filterGroups: [
      {
        filters: [{ propertyName: "email", operator: "EQ", value: email }],
      },
    ],
    limit: 1,
  });
  console.log("searchResponse", JSON.stringify(searchResponse));
  console.log("searchResponse", searchResponse?.results);

  if (searchResponse?.results.length > 0) {
    // exists → update
    const existing = searchResponse.results[0];
    return await hubspotClient.crm.contacts.basicApi.update(existing.id, {
      properties,
    });
  } else {
    // create
    return await hubspotClient.crm.contacts.basicApi.create({ properties });
  }
}

async function associateContactCompany(contactId, companyId) {
  await hubspotClient.crm.associations.v4.basicApi.create(
    "contacts",
    contactId,
    "companies",
    companyId,
    [
      {
        associationCategory: "HUBSPOT_DEFINED",
        associationTypeId: 1, // default contact→company
      },
    ]
  );
}

async function logEmailEngagement(contactId, subject, message) {
  return await hubspotClient.apiRequest({
    method: "POST",
    path: "/crm/v3/objects/emails",
    body: {
      properties: {
        hs_timestamp: new Date().toISOString(),
        hs_email_subject: subject ?? "",
        hs_email_text: message ?? "",
        hs_email_direction: "EMAIL",
        hs_email_status: "SENT",
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 198,
            },
          ],
        },
      ],
    },
  });
}

async function logCommunication(contactId, message) {
  return await hubspotClient.apiRequest({
    method: "POST",
    path: "/crm/v3/objects/communications",
    body: {
      properties: {
        hs_communication_channel_type: "CRM",
        hs_communication_logged_from: "CRM",
        hs_communication_body: message ?? "",
        hs_timestamp: new Date().toISOString(),
      },
      associations: [
        {
          to: { id: contactId },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 1,
            },
          ],
        },
      ],
    },
  });
}

export const hubSpotConsumer = async () => {
  try {
    console.log("[hubSpotConsumer] Handling");

    const context = getRequestContext();
    const {
      env,
      indexAlias,
      opsClient,
      prisma,
      config,
      detailType,
      entityId,
      entityType,
    } = context;

    const leadId = entityId;
    const {
      foundLead: leadData,
      ok,
      errors: foundLeadErrors,
    } = await getLeadDataById(prisma, leadId);
    console.log("[hubSpotConsumer] leadData", leadData);

    if (!ok) {
      console.log("[hubSpotConsumer] foundLeadErrors", foundLeadErrors);
      throw new Error("Lead data not found");
    }

    const leadType = leadData.type;

    const contactProps = {
      email: leadData.email,
      firstname: leadData.firstName ?? "",
      lastname: leadData.lastName ?? "",
      phone: leadData?.phone ?? "",
      city: leadData?.city ?? "",
      lead_source: leadData.source ?? "",
      ...(leadData.specialist?.identityId && {
        cosmediate_identity_id: leadData.specialist.identityId,
      }),
      ...(leadData?.subject && { subject: leadData.subject }),
      ...(leadData?.message && { message: leadData.message }),
    };

    let contactResp;

    // TYPE BASED LOGIC
    if (leadType === "CONTACT") {
      contactProps.title = "Contact";
      contactResp = await findOrCreateContact(leadData.email, contactProps);
    } else if (leadType === "DOCTOR" || leadType === "SPECIALIST") {
      contactProps.title = "Doctor";
      if (leadData?.registerationNumber)
        contactProps.registration_number = leadData?.registerationNumber;

      contactResp = await findOrCreateContact(leadData.email, contactProps);
    } else if (leadType === "CLINIC") {
      contactProps.title = "Clinic";

      // Create clinic contact
      contactResp = await findOrCreateContact(leadData.email, contactProps);
      const contactId = contactResp.id;

      // Create clinic as company
      const companyResp = await hubspotClient.crm.companies.basicApi.create({
        properties: {
          name: leadData?.companyName,
          email: leadData?.email,
          ...(leadData?.registerationNumber && {
            registration_number: leadData?.registerationNumber,
          }),
        },
      });

      const companyId = companyResp.id;

      // Associate contact with company
      await associateContactCompany(contactId, companyId);
    } else if (leadType === "SUBSCRIPTION") {
      contactProps.title = "Subscription";

      contactResp = await findOrCreateContact(leadData?.email, {
        ...contactProps,
        subscription: "true",
      });
    }

    console.log("contactResp", JSON.stringify(contactResp));

    const contactId = contactResp?.id;
    if (!contactId) {
      console.log("[hubSpotConsumer] no contactId — skipping engagement");
      return {
        success: true,
        method: "[hubSpotConsumer] ",
        message: "Sync Completed without engagement",
      };
    }

    // Engagement logging: subject + message
    if (leadData.subject || leadData.message) {
      if (leadData.subject) {
        // Log as email engagement (with both subject & message)
        const emailEngagementRes = await logEmailEngagement(
          contactId,
          leadData.subject,
          leadData.message
        );
        console.log("emailEngagementRes", emailEngagementRes);
      } else {
        // No subject — log as simple communication
        const notesEngagementRes = await logCommunication(
          contactId,
          leadData.message
        );
        console.log("notesEngagementRes", notesEngagementRes);
      }
    }

    console.log("[hubSpotConsumer] Sync complete");
    return {
      success: true,
      method: "[hubSpotConsumer] ",
      message: "Sync Completed with engagement",
    };
  } catch (error) {
    console.log("[hubSpotConsumer] Error", error);

    const statusCode =
      error && typeof error.statusCode === "number" ? error.statusCode : 500;

    throw httpError({ error: API_ERRORS.INTERNAL_ERROR, message: error?.message ?? "Hubspot consumer failed", details: [
      "Hubspot consumer failed",
    ] });
  }
};
