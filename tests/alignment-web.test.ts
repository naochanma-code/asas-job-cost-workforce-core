import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createElement } from "react";
import {
  ProjectFields,
  JobFields,
  TypeSelect,
  projectInput,
  jobInput,
} from "../apps/web/app/foundation-fields";
const { renderToStaticMarkup } = createRequire(import.meta.url)(
  "react-dom/server",
);

test("Alignment Web forms consume API types, retain disabled selection and omit PM appointment for PM", () => {
  const types = [
    {
      id: "custom",
      code: "CUSTOM",
      display_name: "ประเภทจากฐานข้อมูล",
      enabled: true,
    },
    { id: "old", code: "OLD", display_name: "ชื่อเดิม", enabled: false },
  ];
  const create = renderToStaticMarkup(
    createElement(TypeSelect, { kind: "project", types }),
  );
  assert.match(create, /ประเภทจากฐานข้อมูล/);
  assert.doesNotMatch(create, /ชื่อเดิม/);
  const edit = renderToStaticMarkup(
    createElement(TypeSelect, { kind: "project", types, current: "old" }),
  );
  assert.match(edit, /ชื่อเดิม/);
  assert.match(edit, /value="old" selected/);
  const pm = renderToStaticMarkup(
    createElement(ProjectFields, { types, users: [], manager: false }),
  );
  assert.doesNotMatch(pm, /name="project_manager_id"/);
  assert.match(pm, /name="target_completion_date"/);
  const admin = renderToStaticMarkup(
    createElement(ProjectFields, {
      types,
      users: [
        { id: "pm", role: "PM", active: true, display_name: "Fixture PM" },
      ],
      manager: true,
    }),
  );
  assert.match(admin, /name="project_manager_id"/);
  assert.match(admin, /Fixture PM/);
  const job = renderToStaticMarkup(
    createElement(JobFields, { types, people: [] }),
  );
  for (const field of [
    "job_type_id",
    "planned_date",
    "responsible_person_id",
    "description",
    "progress",
    "status",
  ])
    assert.ok(job.includes('name="' + field + '"'));
  assert.deepEqual(
    projectInput({
      progress: "25",
      start_date: "",
      target_completion_date: "",
      project_manager_id: "",
      reason: "",
    }),
    {
      progress: 25,
      start_date: null,
      target_completion_date: null,
      project_manager_id: null,
    },
  );
  assert.deepEqual(
    jobInput({ progress: "50", planned_date: "", responsible_person_id: "" }),
    { progress: 50, planned_date: null, responsible_person_id: null },
  );
});
