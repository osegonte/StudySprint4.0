"""Add notes and knowledge management system

Revision ID: 003
Revises: 002
Create Date: 2024-01-20 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create highlights table first (needed by notes foreign key)
    op.create_table('highlights',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pdf_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('page_number', sa.Integer(), nullable=False),
        sa.Column('highlight_type', sa.String(length=20), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('selected_text', sa.Text(), nullable=True),
        sa.Column('surrounding_text', sa.Text(), nullable=True),
        sa.Column('annotation_text', sa.Text(), nullable=True),
        sa.Column('coordinates', sa.JSON(), nullable=True),
        sa.Column('bounding_boxes', sa.JSON(), nullable=True),
        sa.Column('note_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('importance_level', sa.Integer(), nullable=True),
        sa.Column('confidence_score', sa.DECIMAL(precision=3, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['pdf_id'], ['pdfs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['session_id'], ['study_sessions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create note_versions table (needed by notes foreign key)
    op.create_table('note_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('note_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('change_summary', sa.String(length=500), nullable=True),
        sa.Column('word_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create notes table
    op.create_table('notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('content_type', sa.String(length=20), nullable=True),
        sa.Column('pdf_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('topic_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('parent_note_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('highlight_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('note_type', sa.String(length=30), nullable=True),
        sa.Column('page_number', sa.Integer(), nullable=True),
        sa.Column('is_template', sa.Boolean(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True),
        sa.Column('is_archived', sa.Boolean(), nullable=True),
        sa.Column('word_count', sa.Integer(), nullable=True),
        sa.Column('reading_time_minutes', sa.Integer(), nullable=True),
        sa.Column('linked_notes_count', sa.Integer(), nullable=True),
        sa.Column('backlinks_count', sa.Integer(), nullable=True),
        sa.Column('importance_score', sa.DECIMAL(precision=3, scale=2), nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('note_metadata', sa.JSON(), nullable=True),
        sa.Column('version', sa.Integer(), nullable=True),
        sa.Column('last_version_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['highlight_id'], ['highlights.id'], ),
        sa.ForeignKeyConstraint(['last_version_id'], ['note_versions.id'], ),
        sa.ForeignKeyConstraint(['parent_note_id'], ['notes.id'], ),
        sa.ForeignKeyConstraint(['pdf_id'], ['pdfs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['session_id'], ['study_sessions.id'], ),
        sa.ForeignKeyConstraint(['topic_id'], ['topics.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Now add the note_id foreign key to note_versions
    op.create_foreign_key('fk_note_versions_note_id', 'note_versions', 'notes', ['note_id'], ['id'], ondelete='CASCADE')
    
    # And add the note_id foreign key to highlights
    op.create_foreign_key('fk_highlights_note_id', 'highlights', 'notes', ['note_id'], ['id'])
    
    # Create note_links table
    op.create_table('note_links',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('source_note_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('target_note_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('link_type', sa.String(length=20), nullable=True),
        sa.Column('link_text', sa.String(length=500), nullable=True),
        sa.Column('context_before', sa.String(length=200), nullable=True),
        sa.Column('context_after', sa.String(length=200), nullable=True),
        sa.Column('anchor_position', sa.Integer(), nullable=True),
        sa.Column('strength_score', sa.DECIMAL(precision=3, scale=2), nullable=True),
        sa.Column('is_automatic', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['source_note_id'], ['notes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_note_id'], ['notes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create bookmarks table
    op.create_table('bookmarks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pdf_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('page_number', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('bookmark_type', sa.String(length=20), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('position_y', sa.Float(), nullable=True),
        sa.Column('note_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['note_id'], ['notes.id'], ),
        sa.ForeignKeyConstraint(['pdf_id'], ['pdfs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['session_id'], ['study_sessions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create knowledge_nodes table
    op.create_table('knowledge_nodes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('node_type', sa.String(length=20), nullable=False),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('centrality_score', sa.DECIMAL(precision=5, scale=4), nullable=True),
        sa.Column('betweenness_score', sa.DECIMAL(precision=5, scale=4), nullable=True),
        sa.Column('clustering_coefficient', sa.DECIMAL(precision=5, scale=4), nullable=True),
        sa.Column('degree', sa.Integer(), nullable=True),
        sa.Column('community_id', sa.String(length=50), nullable=True),
        sa.Column('importance_rank', sa.Integer(), nullable=True),
        sa.Column('last_calculated', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create knowledge_edges table
    op.create_table('knowledge_edges',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('source_node_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('target_node_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('edge_type', sa.String(length=30), nullable=False),
        sa.Column('weight', sa.DECIMAL(precision=5, scale=4), nullable=True),
        sa.Column('strength', sa.DECIMAL(precision=3, scale=2), nullable=True),
        sa.Column('context', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['source_node_id'], ['knowledge_nodes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_node_id'], ['knowledge_nodes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for performance
    op.create_index('idx_notes_pdf_id', 'notes', ['pdf_id'], unique=False)
    op.create_index('idx_notes_topic_id', 'notes', ['topic_id'], unique=False)
    op.create_index('idx_notes_session_id', 'notes', ['session_id'], unique=False)
    op.create_index('idx_note_links_source', 'note_links', ['source_note_id'], unique=False)
    op.create_index('idx_note_links_target', 'note_links', ['target_note_id'], unique=False)
    op.create_index('idx_highlights_pdf_page', 'highlights', ['pdf_id', 'page_number'], unique=False)
    op.create_index('idx_bookmarks_pdf_page', 'bookmarks', ['pdf_id', 'page_number'], unique=False)
    op.create_index('idx_knowledge_nodes_type_entity', 'knowledge_nodes', ['node_type', 'entity_id'], unique=True)

    # Create full-text search indexes
    op.execute("CREATE INDEX idx_notes_title_search ON notes USING gin(to_tsvector('english', title))")
    op.execute("CREATE INDEX idx_notes_content_search ON notes USING gin(to_tsvector('english', content))")

def downgrade() -> None:
    op.drop_table('knowledge_edges')
    op.drop_table('knowledge_nodes')
    op.drop_table('bookmarks')
    op.drop_table('note_links')
    op.drop_table('notes')
    op.drop_table('note_versions')
    op.drop_table('highlights')
