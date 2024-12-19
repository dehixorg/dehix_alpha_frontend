function addProjectDomain(
  projectDomain: string,
  projectDomainList: { label: string }[],
  updateProjects: (updatedList: { label: string }[]) => void,
): { label: string }[] {
  const newProjectDomain = projectDomain.trim();

  if (projectDomainList.some((s) => s.label === newProjectDomain)) {
    console.warn(`${newProjectDomain} already exists in the dropdown.`);
    return projectDomainList;
  }

  const updatedProjectDomainsList = [
    ...projectDomainList,
    { label: newProjectDomain },
  ];
  updateProjects(updatedProjectDomainsList);

  return updatedProjectDomainsList;
}
export { addProjectDomain };
