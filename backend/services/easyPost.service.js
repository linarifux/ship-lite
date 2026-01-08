// Backend/services/easyPost.service.js

/**
 * MOCK EASYPOST SERVICE
 * Simulates API responses for development without an API Key.
 */

// 1. Mock: Create Shipment & Get Rates
export const createShipment = async (toAddress, fromAddress, parcel) => {
  console.log("⚠️ MOCK MODE: Creating shipment for", toAddress.city);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    id: `shp_mock_${Date.now()}`,
    rates: [
      {
        id: "rate_usps_priority",
        carrier: "USPS",
        service: "Priority",
        rate: "7.50",
        delivery_days: 2,
        currency: "USD"
      },
      {
        id: "rate_ups_ground",
        carrier: "UPS",
        service: "Ground",
        rate: "8.95",
        delivery_days: 4,
        currency: "USD"
      },
      {
        id: "rate_fedex_2day",
        carrier: "FedEx",
        service: "2Day",
        rate: "12.40",
        delivery_days: 2,
        currency: "USD"
      },
      {
        id: "rate_usps_first_class",
        carrier: "USPS",
        service: "FirstClass",
        rate: "4.20",
        delivery_days: 5,
        currency: "USD"
      }
    ]
  };
};

// 2. Mock: Buy Label
export const buyLabel = async (shipmentId, rateId) => {
  console.log(`⚠️ MOCK MODE: Buying label for rate ${rateId}`);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate a random tracking number
  const mockTracking = `1Z${Math.floor(Math.random() * 1000000000)}00`;

  return {
    id: shipmentId,
    tracking_code: mockTracking,
    selected_rate: {
      carrier: rateId.includes('ups') ? 'UPS' : (rateId.includes('fedex') ? 'FedEx' : 'USPS'),
      service: 'Mock Service'
    },
    postage_label: {
      // Returns a sample PDF label so your "Print" button actually opens something
      label_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    tracker: {
      public_url: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${mockTracking}`
    }
  };
};

