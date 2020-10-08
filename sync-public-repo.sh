set -x

cd "$(dirname "$0")"

# Save short SHA for use later
SHA=$(git rev-parse --short HEAD)

# Copy this repo's contents to the public repo, excluding:
# - internal README
# - internal dev scripts folder
# - this script
# - .git folder
# - .github folder
rsync -av ./ $PUBLIC_REPO_DIR --exclude .git --exclude dev_scripts --exclude README-internal.md --exclude sync-public-repo.sh --exclude .github --delete

# Remove package.json scripts that start with "dev- from the public repo
sed -E -i.bak '/"dev-.*$/d' $PUBLIC_REPO_DIR/DailyPlayground/package.json && rm $PUBLIC_REPO_DIR/DailyPlayground/*.bak

# Push changes to the public repo
# (NOTE: at this point the git client is already configured with the right 
# personal access token, carried over from previous Github Actions checkout 
# actions)
pushd $PUBLIC_REPO_DIR
git config user.name daily-autobot
git config user.email daily-autobot@pluot.co
git add -A
git commit -m "Updated: `date` (source: $SHA)"
git push origin HEAD
popd

set +x
