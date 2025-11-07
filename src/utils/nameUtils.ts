/**
 * Extracts the first name from a full name string.
 * Replicates the SQL Server logic from usp_Leads_UpdateFirstName
 * 
 * @param fullName - The complete name to process
 * @returns The extracted first name, or null if the input is empty
 */
export function extractFirstName(fullName: string | null | undefined): string | null {
  // If no name provided, return null
  if (!fullName) {
    return null;
  }

  // Trim and normalize
  let workName = fullName.trim();

  if (!workName) {
    return null;
  }

  // Common titles/prefixes to remove (case insensitive)
  const titles = [
    'Mr', 'Mr.', 'Mrs', 'Mrs.', 'Ms', 'Ms.', 'Mx', 'Mx.',
    'Sr', 'Sr.', 'Sra', 'Sra.', 'Señor', 'Señora',
    'Dr', 'Dr.', 'Dra', 'Dra.', 'Ing', 'Ing.',
    'Lic', 'Lic.', 'Prof', 'Prof.'
  ];

  // Remove titles repeatedly if present at the start
  let titleFound = true;
  while (titleFound) {
    titleFound = false;
    
    for (const title of titles) {
      // Create regex for case-insensitive matching at the start
      const regex = new RegExp(`^${title}\\s+`, 'i');
      
      if (regex.test(workName)) {
        workName = workName.replace(regex, '').trim();
        titleFound = true;
        break;
      }
    }
  }

  // Take the first "word" as firstName
  const spacePos = workName.indexOf(' ');
  let firstName: string;
  
  if (spacePos > 0) {
    firstName = workName.substring(0, spacePos);
  } else {
    firstName = workName;
  }

  // Remove quotes (double and single) from edges
  firstName = firstName.trim().replace(/^["']|["']$/g, '');

  // Return null if empty after processing
  return firstName || null;
}
