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

describe('openlmis.stockmanagement.transferRequest state', function() {

    beforeEach(function() {
        module('transfer-request', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$state = $injector.get('$state');
            this.$location = $injector.get('$location');
            this.$rootScope = $injector.get('$rootScope');
            this.ADMINISTRATION_RIGHTS = $injector.get('ADMINISTRATION_RIGHTS');
            this.SHOW_TRANSFERS = $injector.get('SHOW_TRANSFERS');
        });

        this.state = this.$state.get('openlmis.stockmanagement.transferRequest');
        this.tableState = this.$state.get('openlmis.stockmanagement.transferRequest.table');

        this.goToUrl = function(url) {
            this.$location.url(url);
            this.$rootScope.$apply();
        };
    });

    it('should be available under \'/stockmanagement/transferRequest\'', function() {
        this.goToUrl('/stockmanagement/transferRequest');

        expect(this.$state.current.name).toEqual('openlmis.stockmanagement.transferRequest');
    });

    it('should require ORDER_CREATE right', function() {
        expect(this.state.accessRights).toEqual([this.ADMINISTRATION_RIGHTS.ORDER_CREATE]);
    });

    it('should be shown in navigation only when transfers are enabled', function() {
        expect(this.state.showInNavigation).toBe(this.SHOW_TRANSFERS);
    });

    it('should not be available offline', function() {
        expect(this.state.isOffline).toBe(false);
    });

    it('should open a request under \'/stockmanagement/transferRequest/:orderId\' with ORDER_CREATE right', function() {
        this.goToUrl('/stockmanagement/transferRequest/order-id');

        expect(this.$state.current.name).toEqual('openlmis.stockmanagement.transferRequest.table');
        expect(this.$state.params.orderId).toEqual('order-id');

        expect(this.tableState.accessRights).toEqual([this.ADMINISTRATION_RIGHTS.ORDER_CREATE]);
    });

});
