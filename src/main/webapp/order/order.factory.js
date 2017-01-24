(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name order.orderFactory
     *
     * @description
     * Manages orders and serves as an abstraction layer between orderService and controllers.
     */
    angular
        .module('order')
        .factory('orderFactory', factory);

    factory.$inject = ['orderService'];

    function factory(orderService) {
        var factory = {
            search: search
        };
        return factory;

        /**
         * @ngdoc method
         * @methodOf order.orderFactory
         * @name search
         *
         * @description
         * Gets orders from the server using orderService and prepares them to be used in
         * controller.
         *
         * @param   {String}    supplyingFacilityId     (required) the ID of the supplying facility
         * @param   {String}    requestingFacilityId    (optional) the ID of the requestingFacility
         * @param   {String}    programId               (optional) the ID of the program
         * @return  {Promise}                           the promise resolving to a list of all
         *                                              matching orders
         */
        function search(supplyingFacilityId, requestingFacilityId, programId) {
            return orderService.search({
                supplyingFacility: supplyingFacilityId,
                requestingFacility: requestingFacilityId,
                program: programId
            });
        }
    }

})();