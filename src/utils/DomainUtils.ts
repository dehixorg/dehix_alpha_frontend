function addDomain(
  domain: string,
  domainList: { label: string }[],
  updateDomains: (updatedList: { label: string }[]) => void,
): { label: string }[] {
  const newDomain = domain.trim();

  if (domainList.some((s) => s.label === newDomain)) {
    console.warn(`${newDomain} already exists in the dropdown.`);
    return domainList;
  }

  const updatedDomainsList = [...domainList, { label: newDomain }];
  updateDomains(updatedDomainsList);

  return updatedDomainsList;
}
export { addDomain };
