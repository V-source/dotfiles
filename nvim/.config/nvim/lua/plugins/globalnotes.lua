return {
  "backdround/global-note.nvim",
	cmd = { "GlobalNote", "ProjectPrivateNote", "ProjectTodo", "ProjectNote" },
	keys = {
		{ "<leader>gn", "<CMD>GlobalNote<CR>", desc = "Global Notes" },
		-- { "<leader>nP", "<CMD>ProjectPrivateNote<CR>", desc = "Private Notes" },
		-- { "<leader>np", "<CMD>ProjectNote<CR>", desc = "Project Note" },
		{ "<leader>pn", "<CMD>ProjectNote<CR>", desc = "Project Note" },
		{ "<leader>fn", "<CMD>ProjectTodo<CR>", desc = "Project Todos" },
	},

  opts = function()
		local get_project_name = function()
			local result = vim.system({
				"git",
				"rev-parse",
				"--show-toplevel",
			}, {
				text = true,
			}):wait()

			if result.stderr ~= "" then
				vim.notify(result.stderr, vim.log.levels.WARN)
				return nil
			end

			local project_directory = result.stdout:gsub("\n", "")

			local project_name = vim.fs.basename(project_directory)
			if project_name == nil then
				vim.notify("Unable to get the project name", vim.log.levels.WARN)
				return nil
			end

			return project_name
		end
		local global_dir = "/home/villegas/git/.notes"
		return {
			autosave = true,
			directory = global_dir,
			filename = "global.md",
			additional_presets = {
				project_private = {
					directory = function()
						return vim.fs.joinpath(global_dir, get_project_name())
					end,
					filename = "note.md",
					title = "Private Project Note",
					command_name = "ProjectPrivateNote",
				},
				project_local = {
					directory = function()
						return vim.fn.getcwd()
					end,
					filename = "note.md",
					title = "Project Note",
					command_name = "ProjectNote",
				},
				project_todo = {
					directory = function()
						return vim.fn.getcwd()
					end,
					filename = "todo.md",
					title = "Project Todo",
					command_name = "ProjectTodo",
				},
			},
		}
	end,
}
