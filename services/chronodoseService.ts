import axios from "axios";

export { fetchChronodosesAroundYou };

type vaccineType = "Pfizer-BioNTech" | "Moderna" | string;

type appointmentScheduleType = {
  name: "chronodose" | string;
  from: string;
  to: string;
  total: number;
};

type centerType = {
  nom: string;
  url: string;
  metadata: { address: string };
  plateforme: string;
  vaccine_type: Array<vaccineType>;
  appointment_schedules: Array<appointmentScheduleType>;
};

type chronodoseDepartmentResponseType = {
  centres_disponibles: Array<centerType>;
};

const DEPARTMENTS_AROUND_YOU = [75, 93, 92, 91, 94];

async function fetchChronodosesAroundYou() {
  await Promise.all(DEPARTMENTS_AROUND_YOU.map(fetchChronodosesForDepartment));
}

async function fetchChronodosesForDepartment(department: number) {
  const chronodoseDepartmentRequest =
    buildChronoseDepartmentRequest(department);
  const { data } = await axios.get<
    any,
    { data: chronodoseDepartmentResponseType }
  >(chronodoseDepartmentRequest);
  const messages = data.centres_disponibles
    .filter(
      (center) =>
        center.vaccine_type.includes("Pfizer-BioNTech") ||
        center.vaccine_type.includes("Moderna")
    )
    .map((center) => {
      const appointmentSchedule =
        extractCenterAppointmentScheduleChronodose(center);
      if (appointmentSchedule) {
        return `${appointmentSchedule.total} créneaux trouvés à l'adresse suivante : "${center.metadata.address}". Cliquer sur le lien suivant : ${center.url}`;
      }
      return undefined;
    })
    .filter(Boolean);
  if (messages.length > 0) {
    console.log(`Départment ${department}`);
    messages.forEach((message) => console.log(message));
  }
}

function extractCenterAppointmentScheduleChronodose(center: centerType) {
  return center.appointment_schedules.find(
    (appointMentSchedule) =>
      appointMentSchedule.name === "chronodose" && appointMentSchedule.total > 0
  );
}
function buildChronoseDepartmentRequest(department: number) {
  return `https://vitemadose.gitlab.io/vitemadose/${department}.json`;
}
