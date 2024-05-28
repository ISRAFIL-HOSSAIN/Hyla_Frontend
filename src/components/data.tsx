let DataField = [
    {
      fieldName: "TIMESTAMP",
      type: "datetime",
      description: "Date and Time (in UTC) when position was recorded by AIS",
    },
    {
      fieldName: "LATITUDE",
      type: "number",
      description: "Geographical latitude (WGS84)",
    },
    {
      fieldName: "LONGITUDE",
      type: "number",
      description: "Geographical longitude (WGS84)",
    },
    {
      fieldName: "COURSE",
      type: "number",
      description: "Course over ground (degrees)",
    },
    {
      fieldName: "SPEED",
      type: "number",
      description: "Speed over ground (knots)",
    },
    {
      fieldName: "HEADING",
      type: "number",
      description:
        "Heading (degrees) of the vessel's hull. A value of 511 indicates there is no heading data.",
    },
    {
      fieldName: "NAVSTAT",
      type: "number",
      description: "Navigation status according to AIS Specification",
    },
    {
      fieldName: "CALLSIGN",
      type: "text",
      description: "Callsign of the vessel",
    },
    {
      fieldName: "type",
      type: "number",
      description: "type of the vessel according to AIS Specification",
    },
    {
      fieldName: "A",
      type: "number",
      description:
        "Dimension (meters) from AIS GPS antenna to the Bow of the vessel",
    },
    {
      fieldName: "B",
      type: "number",
      description:
        "Dimension (meters) from AIS GPS antenna to the Stern of the vessel (Vessel Length = A + B)",
    },
    {
      fieldName: "C",
      type: "number",
      description:
        "Dimension (meters) from AIS GPS antenna to the Port of the vessel",
    },
    {
      fieldName: "D",
      type: "number",
      description:
        "Dimension (meters) from AIS GPS antenna to the Starboard of the vessel (Vessel Width = C + D)",
    },
    {
      fieldName: "DRAUGHT",
      type: "number",
      description: "Current draught (meters) of the vessel",
    },
    {
      fieldName: "DESTINATION",
      type: "text",
      description: "Port of destination (manually entered by the Master)",
    },
    {
      fieldName: "LOCODE",
      type: "text",
      description:
        "A uniquely assigned ID by the United Nations for the destination port (if recognized by API system)",
    },
    {
      fieldName: "ETA_AIS",
      type: "text",
      description:
        "Estimated Time of Arrival at the port of destination (manually entered by the Master)",
    },
    {
      fieldName: "ETA",
      type: "text",
      description:
        "Estimated Time of Arrival in full date/time format (year is added by API system)",
    },
    {
      fieldName: "ETA_PREDICTED",
      type: "text",
      description:
        "Estimated Time of Arrival (in UTC) prediction based on the current speed of the vessel (parameter sat=1 is required, otherwise 'null' is returned)",
    },
    {
      fieldName: "DISTANCE_REMAINING",
      type: "number",
      description:
        "The shortest sea route (in nautical miles) from the vessel's position to the destination port (parameter sat=1 is required, otherwise 'null' is returned)",
    },
    {
      fieldName: "SRC",
      type: "text",
      description: "Source of AIS data - Terrestrial (TER) or Satellite (SAT)",
    },
    {
      fieldName: "ZONE",
      type: "text",
      description: "Name of the World zone where the vessel is located",
    },
    {
      fieldName: "ECA",
      type: "bool",
      description: "Indicates whether the vessel is inside ECA/SECA zone",
    },
  ];


  export default DataField;