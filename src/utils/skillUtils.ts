function addSkill(
  skill: string,
  skillsList: { label: string }[],
  updateSkills: (updatedList: { label: string }[]) => void,
): { label: string }[] {
  const newSkill = skill.trim();

  if (skillsList.some((s) => s.label === newSkill)) {
    console.warn(`${newSkill} already exists in the dropdown.`);
    return skillsList;
  }

  const updatedSkillsList = [...skillsList, { label: newSkill }];
  updateSkills(updatedSkillsList);

  return updatedSkillsList;
}
export { addSkill };
