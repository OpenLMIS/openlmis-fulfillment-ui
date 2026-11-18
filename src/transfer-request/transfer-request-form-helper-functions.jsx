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

export const loadSupplierOptions = (transferService, programId, facilityId) => transferService
    .getPartners(facilityId, programId, 'REQUEST')
    .then(toSupplierOptions);

// A failed call needs no message here: the server error handler already shows the backend's.
export const ignoreShownError = () => {};

export const loadCurrentSupplierOptions = (transferService, programId, facilityId, isCancelled, apply) =>
    loadSupplierOptions(transferService, programId, facilityId)
        .then((result) => {
            if (!isCancelled()) {
                apply(result);
            }
        })
        .catch(ignoreShownError);

export const goToRequestEdit = (order, transferService, history) => transferService
    .createRequest(order)
    .then((createdOrder) => {
        history.push(`/stockmanagement/transferRequest/${createdOrder.id}`);
    })
    .catch(ignoreShownError);
