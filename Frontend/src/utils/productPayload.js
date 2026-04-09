const asTrimmedString = (value) => {
  if (typeof value === "string") return value.trim();
  if (value == null) return "";
  return String(value).trim();
};

const asNumber = (value, fallback = 0) => {
  if (value === "" || value == null) return fallback;
  const next = typeof value === "number" ? value : Number(value);
  return Number.isFinite(next) ? next : fallback;
};

export const buildProductPayload = (formValues) => ({
  name: asTrimmedString(formValues?.name),
  brand: asTrimmedString(formValues?.brand),
  category: asTrimmedString(formValues?.category) || "All",
  description: asTrimmedString(formValues?.description),
  dailyRentalRate: asNumber(formValues?.dailyRentalRate, 0),
  fuelType: asTrimmedString(formValues?.fuelType),
  modelYear: asNumber(formValues?.modelYear, 0),
  seatingCapacity: asNumber(formValues?.seatingCapacity, 0),
  availableLocation: asTrimmedString(formValues?.availableLocation),
});

export const getProductApiErrorMessage = (error) => {
  const rawMessage = error?.response?.data;
  const message =
    typeof rawMessage === "string"
      ? rawMessage
      : rawMessage
        ? JSON.stringify(rawMessage)
        : error?.message || "Network or server error";

  if (/product_available/i.test(message)) {
    return "Backend schema mismatch: the database requires `product_available`, but the current backend entity does not insert it.";
  }

  return message;
};
