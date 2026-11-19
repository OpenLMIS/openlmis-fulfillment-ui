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

describe('openlmis.stockmanagement.transferSend state', function() {

    beforeEach(function() {
        module('transfer-send', function($provide) {
            $provide.value('featureFlagService', {
                set: function() {},
                get: function() {}
            });
        });

        inject(function($injector) {
            this.$q = $injector.get('$q');
            this.$state = $injector.get('$state');
            this.$rootScope = $injector.get('$rootScope');
            this.FULFILLMENT_RIGHTS = $injector.get('FULFILLMENT_RIGHTS');
            this.SHOW_TRANSFERS = $injector.get('SHOW_TRANSFERS');
            this.transferService = $injector.get('transferService');
            this.programService = $injector.get('programService');
            this.facilityFactory = $injector.get('facilityFactory');
        });

        this.state = this.$state.get('openlmis.stockmanagement.transferSend');
        this.partners = [{
            id: 'partner-id',
            name: 'Partner'
        }];

        spyOn(this.transferService, 'getPartners').andReturn(this.$q.resolve(this.partners));
    });

    it('should keep the selection in the url', function() {
        expect(this.state.url).toEqual('/transferSend?programId&facilityId&destinationId');
    });

    it('should require SHIPMENTS_EDIT right', function() {
        expect(this.state.accessRights).toEqual([this.FULFILLMENT_RIGHTS.SHIPMENTS_EDIT]);
    });

    it('should be shown in navigation only when transfers are enabled', function() {
        expect(this.state.showInNavigation).toBe(this.SHOW_TRANSFERS);
    });

    it('should not be available offline', function() {
        expect(this.state.isOffline).toBe(false);
    });

    it('should resolve the programs of the user', function() {
        var programs = [{
            id: 'program-id'
        }];
        spyOn(this.programService, 'getUserPrograms').andReturn(this.$q.resolve(programs));

        var result;
        this.state.resolve.programs({
            //eslint-disable-next-line camelcase
            user_id: 'user-id'
        }, this.programService).then(function(response) {
            result = response;
        });
        this.$rootScope.$apply();

        expect(result).toEqual(programs);
        expect(this.programService.getUserPrograms).toHaveBeenCalledWith('user-id');
    });

    it('should resolve the facilities the user can ship from', function() {
        var facilities = [{
            id: 'facility-id'
        }];
        this.facilityFactory.getSupervisedFacilitiesBasedOnRights = jasmine.createSpy()
            .andReturn(this.$q.resolve(facilities));

        var result;
        this.state.resolve.facilities(this.facilityFactory).then(function(response) {
            result = response;
        });
        this.$rootScope.$apply();

        expect(result).toEqual(facilities);
        expect(this.facilityFactory.getSupervisedFacilitiesBasedOnRights)
            .toHaveBeenCalledWith([this.FULFILLMENT_RIGHTS.SHIPMENTS_EDIT]);
    });

    it('should resolve no partners without a facility', function() {
        var result = this.state.resolve.partners({
            programId: 'program-id'
        }, this.transferService);

        expect(result).toEqual([]);
        expect(this.transferService.getPartners).not.toHaveBeenCalled();
    });

    it('should resolve no partners without a program', function() {
        var result = this.state.resolve.partners({
            facilityId: 'facility-id'
        }, this.transferService);

        expect(result).toEqual([]);
        expect(this.transferService.getPartners).not.toHaveBeenCalled();
    });

    it('should resolve the facilities the selected facility can send to', function() {
        var result;
        this.state.resolve.partners({
            programId: 'program-id',
            facilityId: 'facility-id'
        }, this.transferService).then(function(response) {
            result = response;
        });
        this.$rootScope.$apply();

        expect(result).toEqual(this.partners);
        expect(this.transferService.getPartners).toHaveBeenCalledWith('facility-id', 'program-id', 'SEND');
    });

});
