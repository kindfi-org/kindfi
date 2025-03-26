/**
 * @description      : feature:update tab section
 * @author           : pheobeayo
 * @group            : ODhack 12 contributor
 * @created          : 25/03/2025 - 10:30:54
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 25/03/2025
 * - Author          : pheobeayo
 * - Modification    : fixed the update tab section in the Project Details
 **/

export interface UpdateItem {
  id: string;
  likes: string;
  comments: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  description?: string;
  readMoreUrl: string;
  isFeatured?: boolean;
}
