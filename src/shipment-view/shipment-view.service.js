/*
 * This program is part of the OpenLMIS logistics management information system platform software.
 * Copyright © 2017 VillageReach
 *
 * This program is free software: you can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License as published by the Free Software Foundation, either
 * version 3 of the License, or (at your option) any later version.
 *  
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 
 * See the GNU Affero General Public License for more details. You should have received a copy of
 * the GNU Affero General Public License along with this program. If not, see
 * http://www.gnu.org/licenses.  For additional information contact info@OpenLMIS.org. 
 */

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name shipment-view.shipmentViewService
     *
     * @description
     * 
     */
    angular
        .module('shipment-view')
        .service('shipmentViewService', shipmentViewService);

    shipmentViewService.inject = [
        'ShipmentRepository', 'notificationService', '$state', 'stateTrackerService',
        'loadingModalService', 'ShipmentFactory', 'confirmService'
    ];

    function shipmentViewService(ShipmentRepository, notificationService, stateTrackerService,
                                 $state, loadingModalService, ShipmentFactory, confirmService) {

        var shipmentRepository = new ShipmentRepository();

        this.getShipmentForOrder = getShipmentForOrder;

        function getShipmentForOrder(order) {
            return getShipmentBasedOnOrderStatus(order)
            .then(function(shipment) {
                
                shipment.save = decorateSave(shipment.save);
                shipment.confirm = decorateConfirm(shipment.confirm);
                shipment.delete = decorateDelete(shipment.delete);

                return shipment;
            });
        }

        function getShipmentBasedOnOrderStatus(order) {
            if (order.isOrdered()) {
                //TODO: restore shipment creation from scratch
                return new ShipmentFactory()
                .buildFromOrder(order)
                .then(function(shipment) {
                    return shipmentRepository.createDraft(shipment);
                });
            }

            if (order.isFulfilling()) {
                return shipmentRepository.getDraftByOrderId(order.id);
            }

            if (order.isShipped()) {
                return shipmentRepository.getByOrderId(order.id);
            }
        }

        function decorateSave(originalSave) {
            return function() {
                loadingModalService.open();

                return originalSave.apply(this, arguments)
                .then(function () {
                    notificationService.success('shipmentView.draftHasBeenSaved');
                    $state.reload();
                })
                .catch(function () {
                    notificationService.error('shipmentView.failedToSaveDraft');
                    loadingModalService.close();
                });
            };
        }

        function decorateConfirm(originalConfirm) {
            return function () {
                var shipment = this;
                confirmService.confirm(
                    'shipmentView.confirmShipment.question',
                    'shipmentView.confirmShipment'
                )
                .then(function() {
                    loadingModalService.open();

                    return originalConfirm.apply(shipment)
                    .then(function () {
                        notificationService.success('shipmentView.shipmentHasBeenConfirmed');
                        stateTrackerService.goToPreviousState('openlmis.orders.view');
                    })
                    .catch(function () {
                        notificationService.error('shipmentView.failedToConfirmShipment');
                        loadingModalService.close();
                    });
                });
            };
        }

        function decorateDelete(originalDelete) {
            return function() {
                var shipment = this;
                confirmService.confirmDestroy(
                    'shipmentView.deleteDraftConfirmation',
                    'shipmentView.deleteDraft'
                )
                .then(function() {
                    loadingModalService.open();

                    return originalDelete.apply(shipment)
                    .then(function() {
                        notificationService.success('shipmentView.draftHasBeenDeleted');
                        stateTrackerService.goToPreviousState('openlmis.orders.view');
                    })
                    .catch(function() {
                        notificationService.error('shipmentView.failedToDeleteDraft');
                        loadingModalService.close();
                    });
                });
            };
        }

        
    }

})();