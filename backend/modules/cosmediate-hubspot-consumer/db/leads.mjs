export const getLeadDataById = async (prisma, leadId) => {
  try {
    if (!leadId) return { errors: [], foundLead: null, ok: false };

    const foundLead = await prisma.lead.findUnique({
      where: {
        id: leadId,
        deleted: false,
      },
      include: {
        specialist: { select: { id: true, identityId: true } },
      },
    });
    console.log("foundLead", JSON.stringify(foundLead));

    if (!foundLead) {
      return {
        errors: [`Lead does not exist: ${leadId}`],
        foundLead: null,
        ok: false,
      };
    }

    return {
      errors: [],
      foundLead,
      ok: true,
    };
  } catch (error) {
    console.error("Error occurred at getLeadDataById:", error);
    throw error;
  }
};

export const getLeadsDataById = async (prisma, leadIds) => {
  try {
    if (!leadIds.length) return { errors: [], foundLeads: [], ok: false };

    const foundLeads = await prisma.clinic.findMany({
      where: {
        id: { in: leadIds },
        deleted: false,
      },
    });

    const foundIds = foundLeads.map((c) => c.id);
    const missingIds = leadIds.filter((id) => !foundIds.includes(id));
    const errors = missingIds.map((id) => `Lead does not exist: ${id}`);

    return {
      foundLeads,
      errors,
      ok: errors.length === 0,
    };
  } catch (error) {
    console.error("Error occurred at getLeadsDataById:", error);
    throw error;
  }
};
