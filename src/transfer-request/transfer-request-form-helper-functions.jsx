export const buildTransferRequest = (programId, facilityId, supplyingFacilityId) => ({
    program: { id: programId },
    requestingFacility: { id: facilityId },
    supplyingFacility: { id: supplyingFacilityId },
    facility: { id: facilityId },
    orderLineItems: []
});

export const toSupplierOptions = (partners) => ({
    options: partners.map(partner => ({ name: partner.name, value: partner.id })),
    empty: partners.length === 0
});

export const getErrorMessage = (response, fallback) => _.get(response, ['data', 'message']) || fallback;

export const loadSupplierOptions = (transferService, programId, facilityId) => transferService
    .getPartners(facilityId, programId, 'REQUEST')
    .then(toSupplierOptions);

export const goToRequestEdit = (order, transferService, history, notificationService) => transferService
    .createRequest(order)
    .then((createdOrder) => {
        history.push(`/stockmanagement/transferRequest/${createdOrder.id}`);
    })
    .catch((response) => {
        notificationService.error(getErrorMessage(response, 'transferRequest.create.error'));
    });
