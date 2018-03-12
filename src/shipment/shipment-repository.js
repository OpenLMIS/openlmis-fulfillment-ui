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

    angular
        .module('shipment')
        .factory('ShipmentRepository', ShipmentRepository);

    ShipmentRepository.inject = [
        'Shipment', 'OpenlmisRepository', 'classExtender', 'ShipmentRepositoryImpl'
    ];

    function ShipmentRepository(Shipment, OpenlmisRepository, classExtender, ShipmentRepositoryImpl) {

        classExtender.extend(ShipmentRepository, OpenlmisRepository);

        ShipmentRepository.prototype.createDraft = createDraft;
        ShipmentRepository.prototype.updateDraft = updateDraft;
        ShipmentRepository.prototype.getByOrderId = getByOrderId;
        ShipmentRepository.prototype.getDraftByOrderId = getDraftByOrderId;

        return ShipmentRepository;

        function ShipmentRepository(impl) {
            this.super(Shipment, impl || new ShipmentRepositoryImpl());
        }

        function updateDraft(draft) {
            return this.impl.updateDraft(draft);
        }

        function createDraft(json) {
            var repository = this;

            return this.impl.createDraft(json)
                .then(function(shipmentJson) {
                    return new Shipment(shipmentJson, repository);
                });
        }

        function getDraftByOrderId(orderId) {
            var repository = this;

            return this.impl.getDraftByOrderId(orderId)
                .then(function(shipmentJson) {
                    return new Shipment(shipmentJson, repository);
                });
        }

        function getByOrderId(orderId) {
            var repository = this;

            return this.impl.getByOrderId(orderId)
                .then(function(shipmentJson) {
                    return new Shipment(shipmentJson, repository);
                });
        }

    }

})();