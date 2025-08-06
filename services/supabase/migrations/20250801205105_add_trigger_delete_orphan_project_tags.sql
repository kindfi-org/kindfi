-- FUNCTION: Deletes a tag if it's no longer associated with any project
CREATE OR REPLACE FUNCTION delete_orphan_tag_if_unused()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the tag only if it's not referenced in any project_tag_relationships
  DELETE FROM project_tags
  WHERE id = OLD.tag_id
    AND NOT EXISTS (
      SELECT 1
      FROM project_tag_relationships
      WHERE tag_id = OLD.tag_id
    );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: Invokes the cleanup function after a project_tag_relationship is deleted
CREATE TRIGGER delete_orphan_tag
AFTER DELETE ON project_tag_relationships
FOR EACH ROW
EXECUTE FUNCTION delete_orphan_tag_if_unused();
